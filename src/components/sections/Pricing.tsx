'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { getStripe } from '@/lib/stripe';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  setupFee: number;
  monthlyFee: number;
  popular?: boolean;
  features: string[];
  priceIds: {
    subscription: string;
    setup: string;
  };
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: "Starter",
    setupFee: 199,
    monthlyFee: 29.99,
    priceIds: {
      subscription: 'price_1QJG1mCM0vs93jhuqiNRXAMf',
      setup: 'price_1QJG1mCM0vs93jhu9emshd4q'
    },
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
    setupFee: 499.99,
    monthlyFee: 49.99,
    popular: true,
    priceIds: {
      subscription: 'price_1QJG2KCM0vs93jhucNf9nkiQ',
      setup: 'price_1QJG2YCM0vs93jhuBnbSfrX8'
    },
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
    setupFee: 999.99,
    monthlyFee: 74.99,
    priceIds: {
      subscription: 'price_1QJG3KCM0vs93jhu0huFoYTF',
      setup: 'price_1QJG3KCM0vs93jhuqyF6r8VZ'
    },
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

const Pricing = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    try {
      setLoading(plan.id);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionPriceId: plan.priceIds.subscription,
          setupPriceId: plan.priceIds.setup,
          planName: plan.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Payment Error:', error);
      toast.error('Payment failed. Please try again.');
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
                  <div className="text-gray-600 mt-1">
                    +${plan.setupFee} one-time setup
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
};

export default Pricing;