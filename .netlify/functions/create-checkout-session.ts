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

    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing request body' })
      };
    }

    const { subscriptionPriceId, setupPriceId, planName } = JSON.parse(event.body);

    console.log('Processing request:', {
      subscriptionPriceId,
      setupPriceId,
      planName
    });

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

    try {
      const [setupPrice, subscriptionPrice] = await Promise.all([
        stripe.prices.retrieve(setupPriceId),
        stripe.prices.retrieve(subscriptionPriceId)
      ]);

      console.log('Verified prices:', {
        setup: setupPrice.id,
        subscription: subscriptionPrice.id
      });

    } catch (priceError) {
      console.error('Price verification failed:', priceError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid price IDs',
          details: priceError instanceof Error ? priceError.message : 'Unknown error'
        })
      };
    }

    // Create the session for setup fee only
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: setupPriceId,
          quantity: 1,
        }
      ],
      metadata: {
        planName,
        setupPriceId,
        subscriptionPriceId,
        type: 'setup'
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe?setup_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
      allow_promotion_codes: true,
      payment_intent_data: {
        metadata: {
          planName,
          setupPriceId,
          subscriptionPriceId,
          type: 'setup'
        },
        setup_future_usage: 'off_session'
      }
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