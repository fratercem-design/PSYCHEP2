import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TIERS, getStripePriceEnvKey } from "@/lib/tiers";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Payment system not configured" },
      { status: 503 },
    );
  }

  const stripe = new Stripe(stripeKey);

  const body = await request.json();
  const { tier, interval } = body;

  if (!tier || !["monthly", "yearly"].includes(interval)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Validate tier exists
  const tierConfig = TIERS.find((t) => t.key === tier);
  if (!tierConfig) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  // Get Stripe price ID from env
  const priceEnvKey = getStripePriceEnvKey(tier, interval);
  const priceId = process.env[priceEnvKey];

  if (!priceId) {
    return NextResponse.json(
      { error: `Pricing not configured for ${tierConfig.name} (${interval}). Contact support.` },
      { status: 503 },
    );
  }

  // Get or create Stripe customer
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, session.user.id));
  }

  // Create checkout session
  const origin = request.headers.get("origin") ?? "https://psycheverse.org";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${origin}/membership?success=true`,
    cancel_url: `${origin}/membership`,
    metadata: {
      userId: session.user.id,
      tier: tier,
      interval: interval,
    },
    subscription_data: {
      metadata: {
        userId: session.user.id,
        tier: tier,
      },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
