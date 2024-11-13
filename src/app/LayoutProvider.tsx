'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}