'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { getStripe } from '@/lib/stripe';
import { toast } from 'sonner';

// Define types
interface Plan {
  id: string;
  name: string;
  monthlyFee: number;
  popular?: boolean;
  features: string[];
  priceId: string;
}

// Define available plans
const plans: Plan[] = [
  {
    id: 'starter',
    name: "Starter",
    monthlyFee: 29.99,
    priceId: 'price_1QJLwbA3rr6byWPzDLMZV8pr',
    features: [
      "EV Taxi Branded Booking App",
      "2 Vinyl QR Code Signs",
      "2 Vinyl EV Taxi Signs",
      "2 NFC Cards",
      "Basic Support",
      "Schedule & Request Now App",
    ]
  },
  {
    id: 'professional',
    name: "Professional",
    monthlyFee: 49.99,
    popular: true,
    priceId: 'price_1QJLxrA3rr6byWPzSvL4fgbU',
    features: [
      "Everything in Starter, plus:",
      "2 Magnetic QR Code Signs",
      "2 Magnetic EV Taxi Signs",
      "4 NFC Cards",
      "Priority Support",
      "Advanced Analytics",
      "Multi-Vehicle Support",
      "Customer Management",
      "In App Payment Processing",
      "Branded Booking App",
    ]
  },
  {
    id: 'custom',
    name: "Custom App",
    monthlyFee: 74.99,
    priceId: 'price_1QJLyJA3rr6byWPzNMUfhxcI',
    features: [
      "Make it truly yours. We will make a customized app just for your Business:",
      "Your Own Custom Web URL",
      "2 Custom Magnetic QR Code Signs",
      "2 Custom Logo Signs",
      "8 Custom NFC Cards",
      "24/7 VIP Support",
      "Custom Branding App",
      "Multi-Vehicle Support",
      "Customized Driver App & Features",
      "Business Consulting",
      "Custom Integration Options"
    ]
  }
];

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    try {
      setLoading(plan.id);
      
      // Log the plan data we're about to send
      console.log('Starting checkout for plan:', {
        priceId: plan.priceId,
        planName: plan.name
      });

      // Make request to create checkout session
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name
        }),
      });

      const data = await response.json();
      console.log('Checkout session response:', data);

      // Check for errors in the response
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Validate session ID
      if (!data.sessionId) {
        throw new Error('Invalid checkout session response');
      }

      // Get Stripe instance
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Redirect to Stripe checkout
      const { error } = await stripe.redirectToCheckout({ 
        sessionId: data.sessionId 
      });
      
      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Checkout error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        planId: plan.id,
        planName: plan.name
      });
      
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Payment failed. Please try again or contact support.',
        {
          duration: 5000,
          position: 'top-right',
        }
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="py-20 bg-gray-50" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your business needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`relative rounded-2xl shadow-lg overflow-hidden bg-white ${
                plan.popular ? 'ring-2 ring-blue-600' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.monthlyFee}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading !== null}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } ${loading === plan.id ? 'opacity-75 cursor-not-allowed' : ''} 
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? 'Processing...' : 'Get Started'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p>All plans include automatic updates and security patches.</p>
          <p>Need help choosing? Contact us for a consultation.</p>
        </div>
      </div>
    </section>
  );
}