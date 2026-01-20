import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { ads } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { title, imageUrl, linkUrl } = session.metadata || {};

        if (!title || !imageUrl || !linkUrl) {
          console.error('Missing metadata in checkout session');
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        // Create ad in database
        await db.insert(ads).values({
          title,
          imageUrl,
          linkUrl,
          status: 'pending',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          startsAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        if (subscription.status === 'active') {
          // Activate the ad
          await db.update(ads)
            .set({ 
              status: 'active',
              updatedAt: new Date()
            })
            .where(eq(ads.stripeSubscriptionId, subscription.id));
        } else if (subscription.status === 'past_due' || subscription.status === 'canceled') {
          // Deactivate the ad
          await db.update(ads)
            .set({ 
              status: 'expired',
              updatedAt: new Date()
            })
            .where(eq(ads.stripeSubscriptionId, subscription.id));
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Mark ad as expired
        await db.update(ads)
          .set({ 
            status: 'expired',
            updatedAt: new Date()
          })
          .where(eq(ads.stripeSubscriptionId, subscription.id));

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}