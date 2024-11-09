import { NextResponse } from 'next/server';
import Stripe from 'stripe';

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

interface RequestBody {
  subscriptionPriceId: string;
  setupPriceId: string;
  planName: string;
}

export async function POST(request: Request) {
  try {
    if (!request.body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    const body: RequestBody = await request.json();
    const { subscriptionPriceId, setupPriceId, planName } = body;

    if (!subscriptionPriceId || !setupPriceId || !planName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const metadata = {
      planName,
      subscriptionPriceId,
      setupPriceId,
      timestamp: new Date().toISOString(),
      source: 'website_checkout',
    };

    try {
      await Promise.all([
        stripe.prices.retrieve(subscriptionPriceId),
        stripe.prices.retrieve(setupPriceId)
      ]);
    } catch (error) {
      console.error('Invalid price ID:', error);
      return NextResponse.json(
        { error: 'Invalid price ID provided' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer_creation: 'always',
      line_items: [
        {
          price: subscriptionPriceId,
          quantity: 1,
          adjustable_quantity: {
            enabled: false,
          },
        },
        {
          price: setupPriceId,
          quantity: 1,
          adjustable_quantity: {
            enabled: false,
          },
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
        shipping_address: {
          message: 'Please provide your billing address for tax purposes.',
        },
      },
      locale: 'auto',
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
    });

    return NextResponse.json({ 
      sessionId: session.id,
      success: true,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe API Error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: error.message,
          type: error.type,
          success: false 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        success: false 
      },
      { status: 500 }
    );
  }
}