import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

const PageHeading = React.forwardRef<HTMLDivElement, PageHeadingProps>(
  ({ className, title, subtitle, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-start justify-between mb-8", className)}
        {...props}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-base text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>
    )
  }
)
PageHeading.displayName = "PageHeading"

export { PageHeading }
