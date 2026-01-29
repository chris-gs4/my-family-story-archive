'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  action?: React.ReactNode
  theme?: "default" | "paper-primary"
}

const PageHeading = React.forwardRef<HTMLDivElement, PageHeadingProps>(
  ({ className, title, subtitle, action, theme = "default", ...props }, ref) => {
    const isPaperPrimary = theme === "paper-primary"

    return (
      <div
        ref={ref}
        className={cn("flex items-start justify-between mb-8", className)}
        {...props}
      >
        <div>
          <h1
            className={cn(
              "font-bold leading-tight",
              isPaperPrimary ? "text-5xl" : "text-3xl",
              !isPaperPrimary && "text-foreground"
            )}
            style={{
              ...(isPaperPrimary && {
                fontFamily: 'Georgia, serif',
                color: '#111827',
                letterSpacing: '0.3px',
              }),
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn("mt-2 text-base", !isPaperPrimary && "text-muted-foreground")}
              style={{
                ...(isPaperPrimary && {
                  color: 'rgba(17, 24, 39, 0.60)',
                }),
              }}
            >
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
