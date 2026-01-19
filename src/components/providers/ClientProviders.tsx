'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/lib/hooks/useToast';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
