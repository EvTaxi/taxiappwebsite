import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Check for required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('NEXT_PUBLIC_SITE_URL is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
  typescript: true,
});

// Define the structure of the request body
interface RequestBody {
  subscriptionPriceId: string;
  setupPriceId: string;
  planName: string;
}

// Stripe checkout session handler
export async function POST(request: Request) {
  try {
    // Validate the request body
    if (!request.body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    const body: RequestBody = await request.json();
    const { subscriptionPriceId, setupPriceId, planName } = body;

    // Validate required fields
    if (!subscriptionPriceId || !setupPriceId || !planName) {
      console.error('Missing fields:', { subscriptionPriceId, setupPriceId, planName });
      return NextResponse.json(
        { error: 'Missing required fields', details: { subscriptionPriceId, setupPriceId, planName } },
        { status: 400 }
      );
    }

    // Validate the provided Stripe price IDs
    try {
      await Promise.all([
        stripe.prices.retrieve(subscriptionPriceId),
        stripe.prices.retrieve(setupPriceId)
      ]);
    } catch (error) {
      console.error('Invalid price ID:', error);
      return NextResponse.json(
        { error: 'Invalid price ID provided', details: error.message },
        { status: 400 }
      );
    }

    // Metadata to be attached to the session
    const metadata = {
      planName,
      subscriptionPriceId,
      setupPriceId,
      timestamp: new Date().toISOString(),
      source: 'website_checkout',
    };

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: subscriptionPriceId,
          quantity: 1,
        },
        {
          price: setupPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
      metadata,
      subscription_data: {
        metadata,
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel',
          },
        },
      },
      payment_intent_data: {
        metadata,
        description: `${planName} Plan - Initial payment and setup fee`,
      },
      custom_text: {
        submit: {
          message: 'We will process your subscription and setup immediately after payment.',
        },
      },
      locale: 'auto',
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Session expires in 30 minutes
    });

    console.log('Checkout session created:', session.id);

    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Stripe API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
