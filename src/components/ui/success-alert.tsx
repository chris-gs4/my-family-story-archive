'use client';

interface SuccessAlertProps {
  message: string;
  onDismiss?: () => void;
}

/**
 * Success alert component matching Paper Primary design system
 * Displays success messages with an optional dismiss button
 */
export default function SuccessAlert({ message, onDismiss }: SuccessAlertProps) {
  if (!message) return null;

  return (
    <div
      className="rounded-2xl p-4 mb-6 flex items-start gap-3"
      style={{
        backgroundColor: '#F0FDF4',
        border: '1px solid #86EFAC',
      }}
      role="alert"
    >
      {/* Success Icon */}
      <svg
        className="w-5 h-5 flex-shrink-0 mt-0.5"
        style={{ color: '#16A34A' }}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>

      {/* Success Message */}
      <div className="flex-1">
        <p
          className="text-sm font-medium"
          style={{ color: '#166534' }}
        >
          {message}
        </p>
      </div>

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded-lg p-1 hover:bg-white/50 transition-colors"
          aria-label="Dismiss message"
        >
          <svg
            className="w-4 h-4"
            style={{ color: '#16A34A' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
