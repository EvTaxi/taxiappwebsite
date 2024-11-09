import { Handler, HandlerEvent } from '@netlify/functions';
import Stripe from 'stripe';

// Check for required environment variables early
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('NEXT_PUBLIC_SITE_URL is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia'
});

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  try {
    // Log the incoming request
    console.log('Received request:', {
      method: event.httpMethod,
      body: event.body
    });

    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    if (event.httpMethod !== 'POST') {
      throw new Error(`Invalid method: ${event.httpMethod}`);
    }

    if (!event.body) {
      throw new Error('Request body is missing');
    }

    // Parse and log the request body
    const { subscriptionPriceId, setupPriceId, planName } = JSON.parse(event.body);
    console.log('Parsed request data:', { subscriptionPriceId, setupPriceId, planName });

    // Validate required fields
    if (!subscriptionPriceId || !setupPriceId || !planName) {
      throw new Error(`Missing required fields: ${JSON.stringify({ subscriptionPriceId, setupPriceId, planName })}`);
    }

    // Log the prices we're about to verify
    console.log('Verifying price IDs:', { subscriptionPriceId, setupPriceId });

    // Verify price IDs exist
    try {
      const [subscriptionPrice, setupPrice] = await Promise.all([
        stripe.prices.retrieve(subscriptionPriceId),
        stripe.prices.retrieve(setupPriceId)
      ]);
      console.log('Verified prices:', {
        subscription: subscriptionPrice.id,
        setup: setupPrice.id
      });
    } catch (error) {
      console.error('Price verification failed:', error);
      throw new Error(`Invalid price IDs: ${error.message}`);
    }

    // Create metadata
    const metadata = {
      planName,
      subscriptionPriceId,
      setupPriceId,
      timestamp: new Date().toISOString(),
      source: 'website_checkout',
    };

    // Log checkout session creation attempt
    console.log('Creating checkout session with:', {
      prices: [subscriptionPriceId, setupPriceId],
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer_creation: 'always',
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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
      metadata,
    });

    // Log successful session creation
    console.log('Successfully created session:', session.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      })
    };

  } catch (error) {
    // Detailed error logging
    console.error('Function error:', {
      message: error.message,
      stack: error.stack,
      type: error.type,
      details: error
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error.message,
        type: error.constructor.name
      })
    };
  }
};