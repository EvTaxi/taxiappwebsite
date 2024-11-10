import { Handler } from '@netlify/functions';
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

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  try {
    if (event.httpMethod !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { setupSessionId } = JSON.parse(event.body || '{}');
    
    if (!setupSessionId) {
      throw new Error('Setup session ID is required');
    }

    const setupSession = await stripe.checkout.sessions.retrieve(setupSessionId);
    
    if (!setupSession.metadata?.subscriptionPriceId) {
      throw new Error('Missing subscription price ID in setup session');
    }

    const subscriptionSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: setupSession.customer as string,
      line_items: [
        {
          price: setupSession.metadata.subscriptionPriceId,
          quantity: 1,
        }
      ],
      metadata: {
        planName: setupSession.metadata.planName,
        type: 'subscription',
        setupSessionId,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: subscriptionSession.id,
        url: subscriptionSession.url
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create subscription session',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};