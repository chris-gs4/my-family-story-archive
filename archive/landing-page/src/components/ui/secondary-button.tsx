'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
  variant?: "ghost" | "outline" | "soft"
  fullWidth?: boolean
  icon?: React.ReactNode
  theme?: "default" | "paper-primary"
}

const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({
    className,
    size = "md",
    variant = "outline",
    fullWidth = false,
    icon,
    children,
    theme = "default",
    ...props
  }, ref) => {
    const isPaperPrimary = theme === "paper-primary"

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          // Base
          "relative inline-flex items-center justify-center gap-2",
          "font-medium",
          "transition-all duration-200",
          "focus-ring",
          isPaperPrimary ? "rounded-xl" : "rounded-lg",

          // Variants - Default theme
          theme === "default" && variant === "ghost" && [
            "bg-transparent",
            "text-muted-foreground",
            "hover:bg-muted",
          ],
          theme === "default" && variant === "outline" && [
            "bg-transparent",
            "text-muted-foreground",
            "border border-border",
            "hover:border-primary",
            "hover:text-primary",
            "hover:bg-primary/5",
          ],
          theme === "default" && variant === "soft" && [
            "bg-muted",
            "text-muted-foreground",
            "hover:bg-primary/10",
            "hover:text-primary",
          ],

          // Variants - Paper Primary theme
          theme === "paper-primary" && variant === "ghost" && [
            "bg-transparent",
          ],
          theme === "paper-primary" && variant === "outline" && [
            "bg-transparent",
            "border",
          ],
          theme === "paper-primary" && variant === "soft" && [
          ],

          // Active
          "active:scale-[0.98]",

          // Disabled
          "disabled:opacity-50",
          "disabled:cursor-not-allowed",

          // Sizes
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && (isPaperPrimary ? "h-10 px-4 text-sm" : "h-11 px-5 text-base"),
          size === "lg" && "h-12 px-6 text-lg",

          fullWidth && "w-full",

          className
        )}
        style={{
          ...(isPaperPrimary && variant === "ghost" && {
            color: 'rgba(17, 24, 39, 0.60)',
          }),
          ...(isPaperPrimary && variant === "outline" && {
            color: '#2F6F5E',
            borderColor: 'rgba(17, 24, 39, 0.12)',
          }),
          ...(isPaperPrimary && variant === "soft" && {
            backgroundColor: 'rgba(47, 111, 94, 0.08)',
            color: '#2F6F5E',
          }),
          ...props.style,
        }}
        onMouseEnter={(e) => {
          if (isPaperPrimary) {
            if (variant === "ghost") {
              e.currentTarget.style.color = '#111827'
            } else if (variant === "outline") {
              e.currentTarget.style.borderColor = '#2F6F5E'
              e.currentTarget.style.backgroundColor = 'rgba(47, 111, 94, 0.05)'
            } else if (variant === "soft") {
              e.currentTarget.style.backgroundColor = 'rgba(47, 111, 94, 0.12)'
            }
          }
        }}
        onMouseLeave={(e) => {
          if (isPaperPrimary) {
            if (variant === "ghost") {
              e.currentTarget.style.color = 'rgba(17, 24, 39, 0.60)'
            } else if (variant === "outline") {
              e.currentTarget.style.borderColor = 'rgba(17, 24, 39, 0.12)'
              e.currentTarget.style.backgroundColor = 'transparent'
            } else if (variant === "soft") {
              e.currentTarget.style.backgroundColor = 'rgba(47, 111, 94, 0.08)'
            }
          }
        }}
        {...props}
      >
        {icon && icon}
        {children}
      </button>
    )
  }
)
SecondaryButton.displayName = "SecondaryButton"

export { SecondaryButton }
