'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getStripe } from '@/lib/stripe';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupSessionId = searchParams.get('setup_session_id');
    
    if (!setupSessionId) {
      router.push('/#pricing');
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

        const { error } = await stripe.redirectToCheckout({ 
          sessionId: data.sessionId 
        });
        
        if (error) {
          throw error;
        }

      } catch (error) {
        console.error('Subscription error:', error);
        toast.error(
          error instanceof Error 
            ? error.message 
            : 'Failed to set up subscription. Please try again.',
          {
            duration: 5000,
          }
        );
        router.push('/#pricing');
      } finally {
        setIsLoading(false);
      }
    };

    createSubscription();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Setting Up Your Subscription
        </h2>
        <p className="text-gray-600">
          Please wait while we process your setup payment...
        </p>
      </div>
    </div>
  );
}