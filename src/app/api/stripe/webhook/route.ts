import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { ads, users, psycheTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TIERS, TIER_ORDER } from "@/lib/tiers";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};

        // Check if this is a membership checkout (has userId + tier)
        if (metadata.userId && metadata.tier) {
          await handleMembershipCheckout(session);
        }
        // Check if this is an ad checkout (has title + imageUrl + linkUrl)
        else if (metadata.title && metadata.imageUrl && metadata.linkUrl) {
          await db.insert(ads).values({
            title: metadata.title,
            imageUrl: metadata.imageUrl,
            linkUrl: metadata.linkUrl,
            status: "pending",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            startsAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subMeta = subscription.metadata || {};

        if (subMeta.userId && subMeta.tier) {
          // Membership subscription update
          await handleMembershipUpdate(subscription);
        } else {
          // Ad subscription update (legacy)
          if (subscription.status === "active") {
            await db
              .update(ads)
              .set({ status: "active", updatedAt: new Date() })
              .where(eq(ads.stripeSubscriptionId, subscription.id));
          } else if (
            subscription.status === "past_due" ||
            subscription.status === "canceled"
          ) {
            await db
              .update(ads)
              .set({ status: "expired", updatedAt: new Date() })
              .where(eq(ads.stripeSubscriptionId, subscription.id));
          }
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subMeta = subscription.metadata || {};

        if (subMeta.userId) {
          // Membership cancelled — downgrade to unmarked
          await db
            .update(users)
            .set({
              tier: "unmarked",
              subscriptionStatus: "canceled",
              subscriptionTier: null,
              stripeSubscriptionId: null,
            })
            .where(eq(users.id, subMeta.userId));
        }

        // Also handle ad subscription deletion
        await db
          .update(ads)
          .set({ status: "expired", updatedAt: new Date() })
          .where(eq(ads.stripeSubscriptionId, subscription.id));

        break;
      }

      case "invoice.paid": {
        // Monthly recurring — award PSYCHE bonus
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceSubId = (invoice as unknown as { subscription: string | null }).subscription;
        if (invoiceSubId) {
          const sub = await stripe.subscriptions.retrieve(invoiceSubId);
          const subMeta = sub.metadata || {};

          if (subMeta.userId && subMeta.tier) {
            const tierConfig = TIERS.find((t) => t.key === subMeta.tier);
            if (tierConfig && tierConfig.psycheBonus > 0) {
              // Award monthly PSYCHE bonus
              await db.insert(psycheTransactions).values({
                userId: subMeta.userId,
                amount: tierConfig.psycheBonus,
                txType: "earn",
                source: "purchase",
                description: `Monthly ${tierConfig.name} PSYCHE bonus (+${tierConfig.psycheBonus})`,
              });

              // Update balance
              const user = await db.query.users.findFirst({
                where: eq(users.id, subMeta.userId),
              });
              if (user) {
                await db
                  .update(users)
                  .set({
                    psycheBalance: user.psycheBalance + tierConfig.psycheBonus,
                  })
                  .where(eq(users.id, subMeta.userId));
              }
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

// Handle new membership checkout completion
async function handleMembershipCheckout(session: Stripe.Checkout.Session) {
  const { userId, tier } = session.metadata!;

  // Validate tier is in TIER_ORDER
  if (!TIER_ORDER.includes(tier)) return;

  // Type assertion for the tier value
  const tierValue = tier as
    | "unmarked"
    | "initiate"
    | "acolyte"
    | "seeker"
    | "adept"
    | "keeper"
    | "architect";

  await db
    .update(users)
    .set({
      tier: tierValue,
      stripeSubscriptionId: session.subscription as string,
      subscriptionStatus: "active",
      subscriptionTier: tier,
    })
    .where(eq(users.id, userId));
}

// Handle membership subscription status changes
async function handleMembershipUpdate(subscription: Stripe.Subscription) {
  const { userId, tier } = subscription.metadata;

  if (!userId) return;

  if (subscription.status === "active") {
    const tierValue = tier as
      | "unmarked"
      | "initiate"
      | "acolyte"
      | "seeker"
      | "adept"
      | "keeper"
      | "architect";

    await db
      .update(users)
      .set({
        tier: tierValue,
        subscriptionStatus: "active",
        subscriptionTier: tier,
      })
      .where(eq(users.id, userId));
  } else if (
    subscription.status === "past_due" ||
    subscription.status === "unpaid"
  ) {
    await db
      .update(users)
      .set({ subscriptionStatus: subscription.status })
      .where(eq(users.id, userId));
  } else if (subscription.status === "canceled") {
    await db
      .update(users)
      .set({
        tier: "unmarked",
        subscriptionStatus: "canceled",
        subscriptionTier: null,
        stripeSubscriptionId: null,
      })
      .where(eq(users.id, userId));
  }
}
