import * as React from "react"
import { cn } from "@/lib/utils"

type StatusType = "draft" | "recording" | "processing" | "complete" | "error"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType
  children?: React.ReactNode
  theme?: "default" | "paper-primary"
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "status-badge-draft"
  },
  recording: {
    label: "In Progress",
    className: "status-badge-recording"
  },
  processing: {
    label: "Processing",
    className: "status-badge-processing"
  },
  complete: {
    label: "Complete",
    className: "status-badge-complete"
  },
  error: {
    label: "Error",
    className: "status-badge-error"
  }
}

// Paper Primary theme colors
const paperPrimaryStyles: Record<StatusType, React.CSSProperties> = {
  draft: {
    backgroundColor: 'rgba(17, 24, 39, 0.08)',
    color: 'rgba(17, 24, 39, 0.60)',
    border: '1px solid rgba(17, 24, 39, 0.12)',
  },
  recording: {
    backgroundColor: 'rgba(47, 111, 94, 0.12)',
    color: '#2F6F5E',
    border: '1px solid rgba(47, 111, 94, 0.2)',
  },
  processing: {
    backgroundColor: 'rgba(47, 111, 94, 0.08)',
    color: '#2F6F5E',
    border: '1px solid rgba(47, 111, 94, 0.15)',
  },
  complete: {
    backgroundColor: 'rgba(47, 111, 94, 0.15)',
    color: '#275D4F',
    border: '1px solid rgba(47, 111, 94, 0.25)',
  },
  error: {
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    color: '#DC2626',
    border: '1px solid rgba(220, 38, 38, 0.2)',
  },
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, children, theme = "default", ...props }, ref) => {
    const config = statusConfig[status]
    const isPaperPrimary = theme === "paper-primary"

    return (
      <span
        ref={ref}
        className={cn(
          "status-badge",
          !isPaperPrimary && config.className,
          isPaperPrimary && "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
          className
        )}
        style={{
          ...(isPaperPrimary && paperPrimaryStyles[status]),
          letterSpacing: isPaperPrimary ? '0.2px' : undefined,
          ...props.style,
        }}
        {...props}
      >
        {children || config.label}
      </span>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { StatusBadge }
export type { StatusType }
