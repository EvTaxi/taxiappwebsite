import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

// Ensure required environment variables are present
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SITE_URL environment variable');
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
  typescript: true,
});

// Define types for request body
interface RequestBody {
  priceId: string;
  planName: string;
}

export const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Ensure request method is POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Validate request body exists
    if (!event.body) {
      throw new Error('Request body is required');
    }

    // Parse and validate request body
    let parsedBody: RequestBody;
    try {
      parsedBody = JSON.parse(event.body);
      console.log('Received request body:', parsedBody);
    } catch (error) {
      console.error('Failed to parse request body:', error);
      throw new Error('Invalid JSON in request body');
    }

    const { priceId, planName } = parsedBody;

    // Validate required fields
    if (!priceId) {
      throw new Error('Price ID is required');
    }
    if (!planName) {
      throw new Error('Plan name is required');
    }

    // Verify the price exists in Stripe
    try {
      await stripe.prices.retrieve(priceId);
      console.log('Price verified:', priceId);
    } catch (error) {
      console.error('Invalid price ID:', error);
      throw new Error('Invalid price ID provided');
    }

    // Create metadata for the session
    const metadata = {
      planName,
      priceId,
      source: 'website_checkout',
      timestamp: new Date().toISOString()
    };

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        }
      ],
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata
      }
    });

    console.log('Created checkout session:', session.id);

    // Return successful response
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

    // Handle Stripe specific errors
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
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        type: 'error'
      })
    };
  }
};