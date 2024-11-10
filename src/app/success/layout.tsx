'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const SuccessContent = dynamic(
  () => import('./SuccessContent'),
  { 
    ssr: false,
    loading: () => <LoadingFallback />
  }
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">Loading payment verification...</p>
    </div>
  </div>
);

export default function SuccessLayout() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}