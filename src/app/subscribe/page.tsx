'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getStripe } from '@/lib/stripe';
import { Loader2 } from 'lucide-react';

export default function SubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupSessionId = searchParams.get('setup_session_id');
    
    if (!setupSessionId) {
      setError('No setup session ID found');
      setLoading(false);
      return;
    }

    const createSubscription = async () => {
      try {
        const response = await fetch('/.netlify/functions/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ setupSessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create subscription');
        }

        const stripe = await getStripe();
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }

        await stripe.redirectToCheckout({ 
          sessionId: data.sessionId 
        });
      } catch (err) {
        console.error('Subscription error:', err);
        setError(err instanceof Error ? err.message : 'Failed to set up subscription');
        setLoading(false);
      }
    };

    createSubscription();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/#pricing')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Setting up your subscription...</p>
      </div>
    </div>
  );
}