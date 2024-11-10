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

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  try {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    // Ensure this is a POST request
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Parse and validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing request body' })
      };
    }

    const { subscriptionPriceId, setupPriceId, planName } = JSON.parse(event.body);

    // Log received data
    console.log('Received request:', {
      subscriptionPriceId,
      setupPriceId,
      planName
    });

    // Validate required fields
    if (!subscriptionPriceId || !setupPriceId || !planName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          details: { subscriptionPriceId, setupPriceId, planName }
        })
      };
    }

    // Verify price IDs exist
    try {
      await Promise.all([
        stripe.prices.retrieve(setupPriceId),
        stripe.prices.retrieve(subscriptionPriceId)
      ]);
    } catch (priceError) {
      console.error('Price verification error:', priceError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid price IDs',
          details: priceError instanceof Error ? priceError.message : 'Unknown error'
        })
      };
    }

    // Create metadata
    const metadata = {
      planName,
      setupPriceId,
      subscriptionPriceId,
      timestamp: new Date().toISOString(),
      source: 'website_checkout'
    };

    console.log('Creating checkout session with metadata:', metadata);

    // Create setup session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer_creation: 'always',
      line_items: [
        {
          price: setupPriceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe?setup_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
      metadata,
      allow_promotion_codes: true,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes from now
    });

    console.log('Created checkout session:', session.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    
    // Handle Stripe errors specifically
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

    // Handle other errors
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};