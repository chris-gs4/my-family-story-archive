'use client';

import { useRouter } from 'next/navigation';
import { PROJECT_STATES, getNextStep, getProgressPercentage, getStateMessage, isProcessing } from '@/lib/utils/projectState';
import type { ProjectStatus } from '@prisma/client';

interface ProjectStatusBannerProps {
  projectId: string;
  status: ProjectStatus;
  showNextStep?: boolean;
}

export function ProjectStatusBanner({ projectId, status, showNextStep = true }: ProjectStatusBannerProps) {
  const router = useRouter();
  const stateInfo = PROJECT_STATES[status];
  const nextStep = showNextStep ? getNextStep(status) : null;
  const progress = getProgressPercentage(status);
  const message = getStateMessage(status);
  const processing = isProcessing(status);

  const colorClasses = {
    gray: 'bg-gray-50 border-gray-200 text-gray-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  };

  const progressColorClasses = {
    gray: 'bg-gray-600',
    blue: 'bg-blue-600',
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    yellow: 'bg-yellow-600',
    green: 'bg-green-600',
    emerald: 'bg-emerald-600',
    orange: 'bg-orange-600',
    red: 'bg-red-600',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[stateInfo.color as keyof typeof colorClasses]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {processing && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            )}
            <h3 className="font-semibold">{stateInfo.label}</h3>
          </div>
          <p className="text-sm opacity-90">{message}</p>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="opacity-75">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${progressColorClasses[stateInfo.color as keyof typeof progressColorClasses]}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Next Step Button */}
        {nextStep && !processing && (
          <button
            onClick={() => router.push(`/projects/${projectId}/${nextStep.path}`)}
            className="flex-shrink-0 px-4 py-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow"
          >
            {nextStep.label} →
          </button>
        )}
      </div>
    </div>
  );
}
