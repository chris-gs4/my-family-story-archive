'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';

export default function PaymentPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  if (sessionStatus === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Family Story Archive</h2>
          <SecondaryButton onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </SecondaryButton>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto px-6">
          <PageHeading
            title="Payment Information"
            subtitle="Manage your billing and payment methods"
          />

          <div className="mt-8 text-center py-16">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="text-2xl font-display font-semibold text-text-primary mb-2">
              Payment Management Coming Soon
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Payment methods and billing information will be available here soon. Check back later!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
