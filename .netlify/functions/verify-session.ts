import { Handler, HandlerEvent } from '@netlify/functions';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
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
    if (event.httpMethod !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { sessionId } = JSON.parse(event.body || '{}');
    
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'setup_intent', 'payment_intent']
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        status: session.status,
        customer: session.customer,
        subscription: session.subscription,
        setup_intent: session.setup_intent,
        payment_intent: session.payment_intent,
      })
    };

  } catch (error) {
    console.error('Verification error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to verify session',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};