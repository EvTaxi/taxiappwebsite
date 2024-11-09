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
    if (!event.body) {
      throw new Error('Request body is missing');
    }

    const { setupSessionId } = JSON.parse(event.body);

    // Retrieve the setup session to get the subscription price ID
    const setupSession = await stripe.checkout.sessions.retrieve(setupSessionId);
    const subscriptionPriceId = setupSession.metadata?.subscriptionPriceId;
    const customerId = setupSession.customer;

    if (!subscriptionPriceId || !customerId) {
      throw new Error('Missing required metadata from setup session');
    }

    // Create the subscription session
    const subscriptionSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId as string,
      line_items: [
        {
          price: subscriptionPriceId,
          quantity: 1,
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
      metadata: {
        setupSessionId,
        type: 'subscription',
        source: 'website_checkout'
      }
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