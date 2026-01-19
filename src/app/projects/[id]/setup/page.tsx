// Project Setup Page - Interviewee Information Form
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';

const RELATIONSHIPS = [
  'parent',
  'grandparent',
  'sibling',
  'aunt/uncle',
  'friend',
  'mentor',
  'other',
];

const GENERATIONS = [
  'Greatest Generation (1901-1927)',
  'Silent Generation (1928-1945)',
  'Baby Boomer (1946-1964)',
  'Generation X (1965-1980)',
  'Millennial (1981-1996)',
  'Generation Z (1997-2012)',
];

const COMMON_TOPICS = [
  'childhood',
  'family',
  'education',
  'career',
  'military service',
  'immigration',
  'traditions',
  'relationships',
  'life lessons',
  'hobbies',
];

export default function ProjectSetupPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    birthYear: '',
    generation: '',
    topics: [] as string[],
    notes: '',
  });

  const handleTopicToggle = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Save interviewee information
      const response = await fetch(`/api/projects/${params.id}/interviewee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          relationship: formData.relationship,
          birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
          generation: formData.generation,
          topics: formData.topics,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save interviewee information');
      }

      // Redirect to questions page
      router.push(`/projects/${params.id}/questions`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto">
          <PageHeading
            title="Tell Us About Your Interviewee"
            subtitle="Help us understand who you'll be interviewing so we can generate personalized questions."
          />

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* Basic Information */}
            <div className="card-elevated p-8">
              <h2 className="text-2xl font-display font-semibold text-text-primary mb-6">
                Basic Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border-light focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                    placeholder="e.g., Margaret Wilson"
                  />
                </div>

                <div>
                  <label htmlFor="relationship" className="block text-sm font-medium text-text-primary mb-2">
                    Relationship to You *
                  </label>
                  <select
                    id="relationship"
                    required
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border-light focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  >
                    <option value="">Select relationship...</option>
                    {RELATIONSHIPS.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel.charAt(0).toUpperCase() + rel.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="birthYear" className="block text-sm font-medium text-text-primary mb-2">
                      Birth Year (Optional)
                    </label>
                    <input
                      type="number"
                      id="birthYear"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.birthYear}
                      onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border-light focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                      placeholder="e.g., 1952"
                    />
                  </div>

                  <div>
                    <label htmlFor="generation" className="block text-sm font-medium text-text-primary mb-2">
                      Generation (Optional)
                    </label>
                    <select
                      id="generation"
                      value={formData.generation}
                      onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border-light focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                    >
                      <option value="">Select generation...</option>
                      {GENERATIONS.map((gen) => (
                        <option key={gen} value={gen}>
                          {gen}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Topics of Interest */}
            <div className="card-elevated p-8">
              <h2 className="text-2xl font-display font-semibold text-text-primary mb-2">
                Topics to Explore
              </h2>
              <p className="text-text-secondary mb-6">
                Select the topics you'd like to focus on during the interview. This helps us generate more relevant questions.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COMMON_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicToggle(topic)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.topics.includes(topic)
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                        : 'border-border-light bg-white text-text-secondary hover:border-primary-200'
                    }`}
                  >
                    {topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="card-elevated p-8">
              <h2 className="text-2xl font-display font-semibold text-text-primary mb-2">
                Additional Notes
              </h2>
              <p className="text-text-secondary mb-6">
                Any specific context or details that would help us generate better questions?
              </p>

              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border-light focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                placeholder="e.g., She immigrated from Ireland in the 1960s and has amazing stories about adapting to life in America..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <SecondaryButton
                type="button"
                onClick={() => router.push('/dashboard')}
                disabled={loading}
              >
                Cancel
              </SecondaryButton>

              <PrimaryButton type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Continue to Questions →'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
