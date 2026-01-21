import * as React from "react"
import { cn } from "@/lib/utils"

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({
    className,
    size = "md",
    fullWidth = false,
    loading = false,
    icon,
    children,
    disabled,
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center gap-2",
          "font-semibold",
          "transition-all duration-150",
          "focus-ring",

          // Colors
          "bg-blue-600 text-white",
          "hover:bg-blue-700",

          // Rounded corners
          "rounded-lg",

          // Subtle shadow
          "shadow-sm",
          "hover:shadow-md",

          // Active state
          "active:scale-[0.98]",

          // Disabled
          "disabled:opacity-50",
          "disabled:cursor-not-allowed",
          "disabled:hover:bg-blue-600",
          "disabled:hover:shadow-sm",

          // Sizes
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-11 px-5 text-base",
          size === "lg" && "h-12 px-6 text-lg",

          // Full width
          fullWidth && "w-full",

          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && icon && icon}
        {children}
      </button>
    )
  }
)
PrimaryButton.displayName = "PrimaryButton"

export { PrimaryButton }
