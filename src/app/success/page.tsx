'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      router.push('/#pricing');
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch('/.netlify/functions/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error('Failed to verify payment');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Payment verification failed');
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 p-8 bg-white rounded-2xl shadow-lg text-center">
          <h1 className="text-2xl text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You for Your Purchase!
          </h1>
          <p className="text-gray-600 mb-8">
            We've received your payment and are setting up your account. You'll receive a welcome email shortly with next steps.
          </p>
          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
            <a
              href="mailto:support@evtaxi.app"
              className="block w-full bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}