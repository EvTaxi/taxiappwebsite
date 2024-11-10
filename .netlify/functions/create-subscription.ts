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
    console.log('Received subscription request:', {
      method: event.httpMethod,
      body: event.body
    });

    if (event.httpMethod !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { setupSessionId } = JSON.parse(event.body || '{}');
    
    if (!setupSessionId) {
      throw new Error('Setup session ID is required');
    }

    // Retrieve the setup session
    const setupSession = await stripe.checkout.sessions.retrieve(setupSessionId);
    console.log('Retrieved setup session:', {
      id: setupSession.id,
      customer: setupSession.customer,
      metadata: setupSession.metadata
    });
    
    if (!setupSession.metadata?.subscriptionPriceId) {
      throw new Error('Missing subscription price ID in setup session');
    }

    // Create subscription session
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
        timestamp: new Date().toISOString()
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
    });

    console.log('Created subscription session:', subscriptionSession.id);

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