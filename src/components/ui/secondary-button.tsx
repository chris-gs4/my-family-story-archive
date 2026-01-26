import * as React from "react"
import { cn } from "@/lib/utils"

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
  variant?: "ghost" | "outline" | "soft"
  fullWidth?: boolean
  icon?: React.ReactNode
}

const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({
    className,
    size = "md",
    variant = "outline",
    fullWidth = false,
    icon,
    children,
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          // Base
          "relative inline-flex items-center justify-center gap-2",
          "font-medium",
          "transition-all duration-150",
          "focus-ring",
          "rounded-lg",

          // Variants
          variant === "ghost" && [
            "bg-transparent",
            "text-muted-foreground",
            "hover:bg-muted",
          ],
          variant === "outline" && [
            "bg-transparent",
            "text-muted-foreground",
            "border border-border",
            "hover:border-primary",
            "hover:text-primary",
            "hover:bg-primary/5",
          ],
          variant === "soft" && [
            "bg-muted",
            "text-muted-foreground",
            "hover:bg-primary/10",
            "hover:text-primary",
          ],

          // Active
          "active:scale-[0.98]",

          // Disabled
          "disabled:opacity-50",
          "disabled:cursor-not-allowed",

          // Sizes
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-11 px-5 text-base",
          size === "lg" && "h-12 px-6 text-lg",

          fullWidth && "w-full",

          className
        )}
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
