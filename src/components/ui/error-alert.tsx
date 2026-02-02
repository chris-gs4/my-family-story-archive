'use client';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

/**
 * Error alert component matching Paper Primary design system
 * Displays error messages with an optional dismiss button
 */
export default function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      className="rounded-2xl p-4 mb-6 flex items-start gap-3"
      style={{
        backgroundColor: '#FEF2F2',
        border: '1px solid #FCA5A5',
      }}
      role="alert"
    >
      {/* Error Icon */}
      <svg
        className="w-5 h-5 flex-shrink-0 mt-0.5"
        style={{ color: '#DC2626' }}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>

      {/* Error Message */}
      <div className="flex-1">
        <p
          className="text-sm font-medium"
          style={{ color: '#991B1B' }}
        >
          {message}
        </p>
      </div>

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded-lg p-1 hover:bg-white/50 transition-colors"
          aria-label="Dismiss error"
        >
          <svg
            className="w-4 h-4"
            style={{ color: '#DC2626' }}
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
