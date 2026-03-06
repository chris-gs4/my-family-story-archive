"use client"

import { Loader2 } from "lucide-react"

interface JournalCtaButtonProps {
  children: React.ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  type?: "button" | "submit"
}

export function JournalCtaButton({
  children,
  onClick,
  loading,
  disabled,
  type = "button",
}: JournalCtaButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full py-3.5 px-6 rounded-full text-base font-semibold
        bg-journal-text text-white
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-journal-text/40
        ${disabled || loading
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-black active:scale-[0.98]"
        }
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
