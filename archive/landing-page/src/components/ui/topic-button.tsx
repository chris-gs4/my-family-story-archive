import React from 'react';

interface TopicButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function TopicButton({ label, selected, onClick }: TopicButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
        selected
          ? 'border-blue-600 bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:border-blue-700'
          : 'border-gray-300 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50'
      }`}
    >
      {selected && (
        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </button>
  );
}
