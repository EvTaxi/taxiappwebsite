import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with complete error handling
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('NEXT_PUBLIC_SITE_URL is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export async function POST(request: Request) {
  try {
    // Validate the request
    if (!request.body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { subscriptionPriceId, setupPriceId, planName } = body;

    // Validate required fields
    if (!subscriptionPriceId || !setupPriceId || !planName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create customer metadata
    const metadata = {
      planName,
      subscriptionPriceId,
      setupPriceId,
      timestamp: new Date().toISOString(),
    };

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer_creation: 'always',
      line_items: [
        // Monthly subscription
        {
          price: subscriptionPriceId,
          quantity: 1,
          adjustable_quantity: {
            enabled: false,
          },
        },
        // One-time setup fee
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
      },
      payment_intent_data: {
        metadata,
      },
      // Customize the appearance
      custom_text: {
        submit: {
          message: 'We will process your subscription and setup immediately after payment.',
        },
      },
    });

    // Log successful session creation (you can remove this in production)
    console.log('Checkout session created:', {
      sessionId: session.id,
      planName,
      subscriptionPriceId,
      setupPriceId,
    });

    // Return the session ID
    return NextResponse.json({ 
      sessionId: session.id,
      success: true 
    });

  } catch (error) {
    // Log the error (make sure to not log sensitive info in production)
    console.error('Stripe API Error:', error);

    // Determine if it's a Stripe error
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

    // For other types of errors
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        success: false 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: Request) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}