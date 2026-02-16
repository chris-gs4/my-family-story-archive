// Project Setup Page - Interviewee Information Form
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';
import { TopicButton } from '@/components/ui/topic-button';

const RELATIONSHIPS = [
  'myself',
  'parent',
  'grandparent',
  'sibling',
  'aunt/uncle',
  'friend',
  'mentor',
  'other',
];

const GENERATIONS = [
  { label: 'Greatest Generation (1901-1927)', minYear: 1901, maxYear: 1927 },
  { label: 'Silent Generation (1928-1945)', minYear: 1928, maxYear: 1945 },
  { label: 'Baby Boomer (1946-1964)', minYear: 1946, maxYear: 1964 },
  { label: 'Generation X (1965-1980)', minYear: 1965, maxYear: 1980 },
  { label: 'Millennial (1981-1996)', minYear: 1981, maxYear: 1996 },
  { label: 'Generation Z (1997-2012)', minYear: 1997, maxYear: 2012 },
];

// Helper function to determine generation from birth year
function getGenerationFromBirthYear(year: number): string {
  const birthYear = parseInt(year.toString());
  if (isNaN(birthYear)) return '';

  for (const gen of GENERATIONS) {
    if (birthYear >= gen.minYear && birthYear <= gen.maxYear) {
      return gen.label;
    }
  }

  // Handle years outside defined ranges
  if (birthYear < 1901) return 'Greatest Generation (1901-1927)';
  if (birthYear > 2012) return 'Generation Z (1997-2012)';

  return '';
}

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

  // Auto-populate generation when birth year changes
  useEffect(() => {
    if (formData.birthYear) {
      const year = parseInt(formData.birthYear);
      if (!isNaN(year)) {
        const autoGeneration = getGenerationFromBirthYear(year);
        if (autoGeneration && autoGeneration !== formData.generation) {
          setFormData((prev) => ({ ...prev, generation: autoGeneration }));
        }
      }
    }
  }, [formData.birthYear]);

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
      const intervieweeResponse = await fetch(`/api/projects/${params.id}/interviewee`, {
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

      if (!intervieweeResponse.ok) {
        const data = await intervieweeResponse.json();
        throw new Error(data.error || 'Failed to save interviewee information');
      }

      // Automatically create the first module
      const moduleResponse = await fetch(`/api/projects/${params.id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: '' }),
      });

      if (!moduleResponse.ok) {
        const data = await moduleResponse.json();
        throw new Error(data.error || 'Failed to create module');
      }

      const moduleData = await moduleResponse.json();
      const moduleId = moduleData.data.module.id;

      // Redirect directly to questions page (will show loading state)
      router.push(`/projects/${params.id}/modules/${moduleId}/questions`);
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
                        <option key={gen.label} value={gen.label}>
                          {gen.label}
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
                Select the topics you&apos;d like to focus on during the interview. This helps us generate more relevant questions.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COMMON_TOPICS.map((topic) => (
                  <TopicButton
                    key={topic}
                    label={topic}
                    selected={formData.topics.includes(topic)}
                    onClick={() => handleTopicToggle(topic)}
                  />
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
                {loading ? 'Setting up your story...' : 'Start My Story →'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
