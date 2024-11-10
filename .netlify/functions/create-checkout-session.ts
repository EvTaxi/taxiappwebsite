import { Handler, HandlerEvent } from '@netlify/functions';
import Stripe from 'stripe';

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

    const { subscriptionPriceId, setupPriceId, planName } = JSON.parse(event.body);
    console.log('Processing checkout for:', { subscriptionPriceId, setupPriceId, planName });

    if (!subscriptionPriceId || !setupPriceId || !planName) {
      throw new Error('Missing required fields');
    }

    // Verify price IDs
    try {
      await Promise.all([
        stripe.prices.retrieve(setupPriceId),
        stripe.prices.retrieve(subscriptionPriceId)
      ]);
    } catch (error) {
      console.error('Price verification failed:', error);
      throw new Error('Invalid price IDs');
    }

    // Create setup session for one-time payment
    const setupSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      billing_address_collection: 'required',
      customer_creation: 'always',
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
        type: 'setup',
        timestamp: new Date().toISOString()
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe?setup_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
    });

    console.log('Created setup session:', setupSession.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: setupSession.id,
        url: setupSession.url
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    
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