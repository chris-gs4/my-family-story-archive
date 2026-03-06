"use client"

interface JournalPillButtonProps {
  label: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}

export function JournalPillButton({ label, selected, onClick, disabled }: JournalPillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200
        border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-journal-text/20
        ${selected
          ? "bg-journal-text text-white border-journal-text"
          : "bg-white text-journal-text border-journal-border hover:border-journal-text/40"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.97]"}
      `}
    >
      {label}
    </button>
  )
}
