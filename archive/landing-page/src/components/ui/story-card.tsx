'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface StoryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: "default" | "elevated" | "outlined" | "book-cover"
  /** Interactive hover state */
  interactive?: boolean
  /** Book cover color (only for book-cover variant) */
  coverColor?: string
}

const StoryCard = React.forwardRef<HTMLDivElement, StoryCardProps>(
  ({ className, variant = "default", interactive = false, coverColor, children, ...props }, ref) => {
    const isBookCover = variant === "book-cover"

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "relative",
          !isBookCover && "rounded-lg p-6",
          isBookCover && "rounded-3xl flex flex-col overflow-hidden transition-all duration-300",

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
          variant === "book-cover" && [
            "bg-white",
            "border",
          ],

          // Interactive states
          interactive && !isBookCover && [
            "cursor-pointer",
            "transition-all duration-200",
            "hover:shadow-lg",
            "hover:-translate-y-0.5",
            "hover:border-primary",
            "active:translate-y-0",
          ],
          interactive && isBookCover && [
            "cursor-pointer",
          ],

          className
        )}
        style={{
          ...(isBookCover && {
            height: '540px',
            boxShadow: '0 12px 32px rgba(17, 24, 39, 0.08)',
            borderColor: 'rgba(17, 24, 39, 0.08)',
          }),
          ...props.style,
        }}
        onMouseEnter={(e) => {
          if (isBookCover && interactive) {
            e.currentTarget.style.boxShadow = '0 16px 40px rgba(17, 24, 39, 0.12)'
            e.currentTarget.style.transform = 'translateY(-4px)'
          }
        }}
        onMouseLeave={(e) => {
          if (isBookCover && interactive) {
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(17, 24, 39, 0.08)'
            e.currentTarget.style.transform = 'translateY(0)'
          }
        }}
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

// Book Cover Specific Components
interface StoryCardCoverProps extends React.HTMLAttributes<HTMLDivElement> {
  coverColor?: string
}

const StoryCardCover = React.forwardRef<HTMLDivElement, StoryCardCoverProps>(
  ({ className, coverColor = '#EAF4EF', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative flex flex-col items-center justify-center text-center", className)}
      style={{
        backgroundColor: coverColor,
        height: '210px',
        padding: '62px 20px 28px 20px',
        ...props.style,
      }}
      {...props}
    >
      {/* Nested frame lines (signature motif) */}
      <div
        className="absolute inset-3 rounded-lg pointer-events-none"
        style={{
          border: '1px solid rgba(17, 24, 39, 0.18)',
          zIndex: 1,
        }}
      />
      <div
        className="absolute rounded-lg pointer-events-none"
        style={{
          top: '22px',
          left: '22px',
          right: '22px',
          bottom: '22px',
          border: '1px solid rgba(17, 24, 39, 0.18)',
          zIndex: 1,
        }}
      />
      {children}
    </div>
  )
)
StoryCardCover.displayName = "StoryCardCover"

interface StoryCardBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'top-left' | 'top-right'
}

const StoryCardBadge = React.forwardRef<HTMLDivElement, StoryCardBadgeProps>(
  ({ className, position = 'top-left', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm",
        position === 'top-left' && "top-3 left-3",
        position === 'top-right' && "top-3 right-3",
        className
      )}
      style={{
        backgroundColor: '#2F6F5E',
        boxShadow: '0 2px 4px rgba(17, 24, 39, 0.12)',
        zIndex: 20,
        ...props.style,
      }}
      {...props}
    >
      {children}
    </div>
  )
)
StoryCardBadge.displayName = "StoryCardBadge"

interface StoryCardPhotoWindowProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl?: string | null
}

const StoryCardPhotoWindow = React.forwardRef<
  HTMLDivElement,
  StoryCardPhotoWindowProps
>(({ className, children, imageUrl, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl flex items-center justify-center flex-col text-center overflow-hidden",
      className
    )}
    style={{
      height: '150px',
      backgroundColor: imageUrl ? 'transparent' : 'rgba(17, 24, 39, 0.02)',
      border: imageUrl ? 'none' : '1px dashed rgba(17, 24, 39, 0.18)',
      ...props.style,
    }}
    {...props}
  >
    {imageUrl ? (
      <img
        src={imageUrl}
        alt="Module cover"
        className="w-full h-full object-cover"
      />
    ) : children ? (
      children
    ) : (
      <>
        <svg
          className="w-12 h-12 mb-2"
          style={{ color: 'rgba(17, 24, 39, 0.25)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-xs" style={{ color: 'rgba(17, 24, 39, 0.45)' }}>
          Add cover photo
        </p>
      </>
    )}
  </div>
))
StoryCardPhotoWindow.displayName = "StoryCardPhotoWindow"

interface StoryCardProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number
}

const StoryCardProgressBar = React.forwardRef<HTMLDivElement, StoryCardProgressBarProps>(
  ({ className, progress, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} {...props}>
      <div
        className="w-full rounded-full h-1.5 overflow-hidden relative"
        style={{
          backgroundColor: 'rgba(17, 24, 39, 0.08)',
        }}
      >
        {/* Filled portion */}
        <div
          className="h-full transition-all duration-500 relative"
          style={{
            width: `${progress}%`,
            backgroundColor: '#2F6F5E',
          }}
        >
          {/* Subtle page segments overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 9%, rgba(255,255,255,0.12) 9%, rgba(255,255,255,0.12) 10%)',
            }}
          />
        </div>
      </div>
    </div>
  )
)
StoryCardProgressBar.displayName = "StoryCardProgressBar"

export {
  StoryCard,
  StoryCardHeader,
  StoryCardTitle,
  StoryCardContent,
  StoryCardFooter,
  StoryCardCover,
  StoryCardBadge,
  StoryCardPhotoWindow,
  StoryCardProgressBar,
}
