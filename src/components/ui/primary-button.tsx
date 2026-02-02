'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  loading?: boolean
  icon?: React.ReactNode
  theme?: "default" | "paper-primary" | "action-required"
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
    theme = "default",
    ...props
  }, ref) => {
    const isPaperPrimary = theme === "paper-primary"
    const isActionRequired = theme === "action-required"
    const isCustomTheme = isPaperPrimary || isActionRequired

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center gap-2",
          "font-semibold",
          "transition-all duration-200",
          "focus-ring",

          // Colors - Default theme
          theme === "default" && [
            "bg-blue-600 text-white",
            "hover:bg-blue-700",
            "disabled:hover:bg-blue-600",
          ],

          // Colors - Paper Primary theme
          theme === "paper-primary" && [
            "text-white",
          ],

          // Colors - Action Required theme
          theme === "action-required" && [
            "text-white",
          ],

          // Rounded corners
          isCustomTheme ? "rounded-xl" : "rounded-lg",

          // Subtle shadow
          "shadow-sm",
          isCustomTheme && "hover:shadow-md",
          !isCustomTheme && "hover:shadow-md",

          // Active state
          "active:scale-[0.98]",

          // Disabled
          "disabled:opacity-50",
          "disabled:cursor-not-allowed",
          "disabled:hover:shadow-sm",

          // Sizes
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && (isCustomTheme ? "h-10 px-4 text-sm" : "h-11 px-5 text-base"),
          size === "lg" && "h-12 px-6 text-lg",

          // Full width
          fullWidth && "w-full",

          className
        )}
        style={{
          ...(isPaperPrimary && {
            backgroundColor: '#2F6F5E',
          }),
          ...(isActionRequired && {
            backgroundColor: '#DC2626', // Red-600
          }),
          ...props.style,
        }}
        onMouseEnter={(e) => {
          if (isPaperPrimary && !disabled && !loading) {
            e.currentTarget.style.backgroundColor = '#275D4F'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(47, 111, 94, 0.2)'
          }
          if (isActionRequired && !disabled && !loading) {
            e.currentTarget.style.backgroundColor = '#B91C1C' // Red-700
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.2)'
          }
        }}
        onMouseLeave={(e) => {
          if (isPaperPrimary && !disabled && !loading) {
            e.currentTarget.style.backgroundColor = '#2F6F5E'
            e.currentTarget.style.boxShadow = ''
          }
          if (isActionRequired && !disabled && !loading) {
            e.currentTarget.style.backgroundColor = '#DC2626'
            e.currentTarget.style.boxShadow = ''
          }
        }}
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
