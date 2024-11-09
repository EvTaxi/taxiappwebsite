import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
});

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { subscriptionPriceId, setupPriceId, planName } = JSON.parse(event.body || '{}');

    if (!subscriptionPriceId || !setupPriceId || !planName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const metadata = {
      planName,
      subscriptionPriceId,
      setupPriceId,
      timestamp: new Date().toISOString(),
      source: 'website_checkout',
    };

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer_creation: 'always',
      line_items: [
        {
          price: subscriptionPriceId,
          quantity: 1,
          adjustable_quantity: {
            enabled: false,
          },
        },
        {
          price: setupPriceId,
          quantity: 1,
          adjustable_quantity: {
            enabled: false,
          },
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
      metadata,
      subscription_data: {
        metadata,
      },
      payment_intent_data: {
        metadata,
        description: `${planName} Plan - Initial payment and setup fee`,
      },
      custom_text: {
        submit: {
          message: 'We will process your subscription and setup immediately after payment.',
        },
      },
      locale: 'auto',
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        sessionId: session.id,
        success: true,
        url: session.url,
      }),
    };

  } catch (error) {
    console.error('Stripe API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' }),
    };
  }
};

export { handler };