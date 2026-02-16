'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';
import { useToast } from '@/lib/hooks/useToast';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (sessionStatus === 'authenticated' && session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      setLoading(false);
    }
  }, [sessionStatus, session, router]);

  const handleSaveProfile = async () => {
    setSaving(true);

    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    showToast('Profile updated successfully!', 'success');
    setSaving(false);
  };

  const handleChangePassword = () => {
    showToast('Password change coming soon!', 'info');
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Mabel</h2>
          <SecondaryButton onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </SecondaryButton>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto px-6">
          <PageHeading
            title="My Profile"
            subtitle="Manage your account information and preferences"
          />

          <div className="mt-8 space-y-6">
            {/* Profile Picture Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Profile Picture</h3>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-3xl font-medium text-primary-700">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-3">
                    Upload a profile picture to personalize your account
                  </p>
                  <SecondaryButton disabled>
                    Upload Photo (Coming Soon)
                  </SecondaryButton>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-text-secondary">
                    Email cannot be changed. Contact support if you need to update your email.
                  </p>
                </div>

                <div className="pt-4">
                  <PrimaryButton onClick={handleSaveProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </PrimaryButton>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">Password</p>
                    <p className="text-sm text-text-secondary">••••••••</p>
                  </div>
                  <SecondaryButton onClick={handleChangePassword}>
                    Change Password
                  </SecondaryButton>
                </div>
              </div>
            </div>

            {/* Payment Information (Placeholder) */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Payment Information</h3>
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-text-secondary mb-4">No payment method on file</p>
                <SecondaryButton disabled>
                  Add Payment Method (Coming Soon)
                </SecondaryButton>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white border border-red-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">Delete Account</p>
                    <p className="text-sm text-text-secondary">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <button
                    onClick={() => showToast('Account deletion coming soon', 'info')}
                    className="px-4 py-2 border-2 border-red-600 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
