import { NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
  typescript: true,
});

// Define the structure of the request body
interface RequestBody {
  priceId: string;
  planName: string;
}

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
    const { priceId, planName } = body;

    // Validate required fields
    if (!priceId || !planName) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          details: { priceId, planName } 
        },
        { status: 400 }
      );
    }

    // Validate the provided Stripe price ID
    try {
      await stripe.prices.retrieve(priceId);
    } catch (error) {
      console.error('Invalid price ID:', error);
      return NextResponse.json(
        { 
          error: 'Invalid price ID provided',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 400 }
      );
    }

    // Create metadata for tracking
    const metadata = {
      planName,
      timestamp: new Date().toISOString(),
      source: 'website_checkout'
    };

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'required',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        }
      ],
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata
      },
      custom_text: {
        submit: {
          message: 'We will process your subscription immediately after payment.'
        }
      },
      customer_creation: 'always',
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Stripe API Error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}