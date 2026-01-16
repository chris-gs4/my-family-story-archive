import * as React from "react"
import { cn } from "@/lib/utils"

interface StoryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: "default" | "elevated" | "outlined"
  /** Interactive hover state */
  interactive?: boolean
}

const StoryCard = React.forwardRef<HTMLDivElement, StoryCardProps>(
  ({ className, variant = "default", interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "relative rounded-lg p-6",

          // Variants
          variant === "default" && [
            "bg-card",
            "border border-border",
          ],
          variant === "elevated" && [
            "bg-card",
            "shadow-md",
          ],
          variant === "outlined" && [
            "bg-transparent",
            "border-2 border-border",
          ],

          // Interactive states
          interactive && [
            "cursor-pointer",
            "transition-all duration-200",
            "hover:shadow-lg",
            "hover:-translate-y-0.5",
            "hover:border-primary",
            "active:translate-y-0",
          ],

          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
StoryCard.displayName = "StoryCard"

// Sub-components
const StoryCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start justify-between mb-3", className)}
    {...props}
  />
))
StoryCardHeader.displayName = "StoryCardHeader"

const StoryCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold text-foreground",
      "leading-snug",
      className
    )}
    {...props}
  />
))
StoryCardTitle.displayName = "StoryCardTitle"

const StoryCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
))
StoryCardContent.displayName = "StoryCardContent"

const StoryCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 mt-4 pt-4 border-t border-border", className)}
    {...props}
  />
))
StoryCardFooter.displayName = "StoryCardFooter"

export {
  StoryCard,
  StoryCardHeader,
  StoryCardTitle,
  StoryCardContent,
  StoryCardFooter
}
