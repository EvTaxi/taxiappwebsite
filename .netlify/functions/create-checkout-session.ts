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

  // Debug log
  console.log('Function started with environment:', {
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL
  });

  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    if (!event.body) {
      throw new Error('Request body is missing');
    }

    // Parse request body
    const { subscriptionPriceId, setupPriceId, planName } = JSON.parse(event.body);
    
    // Debug log
    console.log('Received request:', {
      subscriptionPriceId,
      setupPriceId,
      planName
    });

    // Validate inputs
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

    // Create session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
      metadata: {
        planName,
        source: 'website_checkout'
      }
    });

    // Debug log
    console.log('Session created:', {
      sessionId: session.id,
      url: session.url
    });

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
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof Stripe.errors.StripeError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Stripe API Error',
          details: error.message,
          type: error.type
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};