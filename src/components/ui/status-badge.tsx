import * as React from "react"
import { cn } from "@/lib/utils"

type StatusType = "draft" | "recording" | "processing" | "complete" | "error"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType
  children?: React.ReactNode
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

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, children, ...props }, ref) => {
    const config = statusConfig[status]

    return (
      <span
        ref={ref}
        className={cn("status-badge", config.className, className)}
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
