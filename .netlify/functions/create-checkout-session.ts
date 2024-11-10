import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SITE_URL');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia'
});

interface RequestBody {
  priceId: string;
  planName: string;
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!event.body) {
      throw new Error('Missing request body');
    }

    // Parse and validate request body
    const body: RequestBody = JSON.parse(event.body);
    console.log('Received request body:', body);

    const { priceId, planName } = body;

    if (!priceId) {
      throw new Error('Missing priceId');
    }

    if (!planName) {
      throw new Error('Missing planName');
    }

    // Verify the price exists in Stripe
    console.log('Verifying price:', priceId);
    const price = await stripe.prices.retrieve(priceId);
    console.log('Price verified:', price.id);

    const metadata = {
      planName,
      priceId,
      source: 'website_checkout',
      timestamp: new Date().toISOString()
    };

    // Create checkout session
    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata
      },
      customer_email: undefined, // Let Stripe collect this
      client_reference_id: undefined, // Optional: Add if you want to track orders
    });

    console.log('Checkout session created:', session.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      })
    };

  } catch (error) {
    console.error('Error processing request:', error);

    // Handle specific error types
    if (error instanceof Stripe.errors.StripeError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: error.message,
          type: error.type
        })
      };
    }

    // Handle validation errors
    if (error instanceof Error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: error.message,
          type: 'validation_error'
        })
      };
    }

    // Handle unknown errors
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'An unexpected error occurred',
        type: 'server_error'
      })
    };
  }
};