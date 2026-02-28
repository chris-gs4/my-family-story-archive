# Mabel - Design System

**Purpose:** Create a warm, trustworthy, and timeless design that honors personal life stories
**Executor:** Claude Code
**Priority:** High - Foundation for all UI development

---

## Executive Summary

Mabel should feel like opening a treasured family album - warm, personal, and timeless. The design is clean and modern but never cold, professional but never corporate. Every interaction should feel respectful of the precious memories being preserved.

**Core Metaphor:** A digital memory box that will be cherished for generations.

**Design Philosophy:**
- **Warm minimalism** - Clean layouts with emotional warmth
- **Timeless aesthetics** - Design that won't feel dated in 20 years
- **Content-first** - Stories are the hero, UI supports them
- **Trust and permanence** - Visual cues of reliability and longevity

---

## Part 1: Design Tokens

### File: `src/app/globals.css`

```css
@layer base {
  :root {
    /* ======================
       FAMILY ARCHIVE COLOR SYSTEM
       ====================== */

    /* Base Surfaces - Warm neutrals for comfort */
    --background: #FAFAFA;              /* Soft off-white, never harsh white */
    --surface: #FFFFFF;                 /* Card surfaces */
    --surface-elevated: #FFFFFF;        /* Modals, elevated cards */
    --surface-subtle: #F5F5F5;          /* Subtle backgrounds for sections */

    /* Primary Accent - Trustworthy blue */
    --primary: #4F6FFF;                 /* Confident blue - primary actions */
    --primary-hover: #3D5FEE;           /* Darker blue for hover */
    --primary-light: #EEF1FF;           /* Very light blue for subtle highlights */
    --primary-text: #FFFFFF;            /* White text on primary buttons */

    /* Secondary Accent - Warm success/completion */
    --secondary: #10B981;               /* Warm teal/green - success, complete */
    --secondary-hover: #059669;
    --secondary-light: #D1FAE5;

    /* Semantic Colors */
    --success: #10B981;                 /* Positive actions, completed */
    --success-bg: #D1FAE5;
    --success-border: #6EE7B7;

    --warning: #F59E0B;                 /* Caution, in-progress */
    --warning-bg: #FEF3C7;
    --warning-border: #FCD34D;

    --error: #EF4444;                   /* Errors, destructive actions */
    --error-bg: #FEE2E2;
    --error-border: #FCA5A5;

    --info: #3B82F6;                    /* Informational */
    --info-bg: #DBEAFE;
    --info-border: #93C5FD;

    /* Text Hierarchy */
    --text-primary: #1F2937;            /* Main headings, important text */
    --text-secondary: #4B5563;          /* Body text, descriptions */
    --text-tertiary: #6B7280;           /* Captions, metadata, secondary info */
    --text-disabled: #9CA3AF;           /* Disabled state text */
    --text-inverse: #FFFFFF;            /* Text on dark backgrounds */

    /* Borders & Dividers */
    --border: #E5E7EB;                  /* Standard borders */
    --border-subtle: #F3F4F6;           /* Very subtle dividers */
    --border-focus: #4F6FFF;            /* Focus rings */

    /* Shadows - Subtle depth */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

    /* Project Status Colors */
    --status-draft: #9CA3AF;
    --status-recording: #F59E0B;
    --status-processing: #3B82F6;
    --status-complete: #10B981;
    --status-error: #EF4444;

    /* ======================
       TYPOGRAPHY SYSTEM
       ====================== */

    /* Font Families */
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;  /* Same as sans for consistency */
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

    /* Type Scale - Modular scale based on 16px */
    --text-xs: 0.75rem;      /* 12px - captions, labels */
    --text-sm: 0.875rem;     /* 14px - secondary text */
    --text-base: 1rem;       /* 16px - body text */
    --text-lg: 1.125rem;     /* 18px - emphasized text */
    --text-xl: 1.25rem;      /* 20px - card titles */
    --text-2xl: 1.5rem;      /* 24px - section headings */
    --text-3xl: 1.875rem;    /* 30px - page titles */
    --text-4xl: 2.25rem;     /* 36px - hero text */

    /* Line Heights */
    --leading-tight: 1.25;
    --leading-snug: 1.375;
    --leading-normal: 1.5;
    --leading-relaxed: 1.625;
    --leading-loose: 2;

    /* Font Weights */
    --font-normal: 400;
    --font-medium: 500;
    --font-semibold: 600;
    --font-bold: 700;

    /* ======================
       SPACING SYSTEM
       ====================== */

    --space-0: 0;
    --space-1: 0.25rem;      /* 4px */
    --space-2: 0.5rem;       /* 8px */
    --space-3: 0.75rem;      /* 12px */
    --space-4: 1rem;         /* 16px */
    --space-5: 1.25rem;      /* 20px */
    --space-6: 1.5rem;       /* 24px */
    --space-8: 2rem;         /* 32px */
    --space-10: 2.5rem;      /* 40px */
    --space-12: 3rem;        /* 48px */
    --space-16: 4rem;        /* 64px */

    /* ======================
       BORDERS & RADII
       ====================== */

    --radius-none: 0;
    --radius-sm: 0.25rem;    /* 4px - subtle rounding */
    --radius-md: 0.5rem;     /* 8px - standard cards, buttons */
    --radius-lg: 0.75rem;    /* 12px - larger cards */
    --radius-xl: 1rem;       /* 16px - modals, major surfaces */
    --radius-full: 9999px;   /* Pills, avatars */

    /* ======================
       TRANSITIONS
       ====================== */

    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slower: 500ms cubic-bezier(0.4, 0, 0.2, 1);

    /* ======================
       Z-INDEX SCALE
       ====================== */

    --z-base: 0;
    --z-dropdown: 1000;
    --z-sticky: 1100;
    --z-fixed: 1200;
    --z-modal-backdrop: 1300;
    --z-modal: 1400;
    --z-popover: 1500;
    --z-tooltip: 1600;
    --z-toast: 1700;
  }
}
```

### Utility Classes

```css
@layer utilities {
  /* Container */
  .container-narrow {
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .container-medium {
    max-width: 768px;
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .container-wide {
    max-width: 1024px;
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--space-6);
    padding-right: var(--space-6);
  }

  /* Focus Ring - Consistent across all interactive elements */
  .focus-ring {
    outline: none;
    transition: box-shadow var(--transition-fast);
  }

  .focus-ring:focus-visible {
    box-shadow: 0 0 0 3px var(--primary-light);
    border-color: var(--border-focus);
  }

  /* Status Badge Variants */
  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
  }

  .status-badge-draft {
    background: #F3F4F6;
    color: var(--status-draft);
  }

  .status-badge-recording {
    background: var(--warning-bg);
    color: var(--status-recording);
  }

  .status-badge-processing {
    background: var(--info-bg);
    color: var(--status-processing);
  }

  .status-badge-complete {
    background: var(--success-bg);
    color: var(--status-complete);
  }

  .status-badge-error {
    background: var(--error-bg);
    color: var(--status-error);
  }
}
```

---

## Part 2: Core Components

### Component 1: StoryCard (Project Card)

**File:** `src/components/ui/story-card.tsx`

```tsx
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
            "bg-[var(--surface)]",
            "border border-[var(--border)]",
          ],
          variant === "elevated" && [
            "bg-[var(--surface-elevated)]",
            "shadow-[var(--shadow-md)]",
          ],
          variant === "outlined" && [
            "bg-transparent",
            "border-2 border-[var(--border)]",
          ],

          // Interactive states
          interactive && [
            "cursor-pointer",
            "transition-all duration-[var(--transition-base)]",
            "hover:shadow-[var(--shadow-lg)]",
            "hover:-translate-y-0.5",
            "hover:border-[var(--primary)]",
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
      "text-[var(--text-xl)] font-semibold text-[var(--text-primary)]",
      "leading-[var(--leading-snug)]",
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
    className={cn("text-[var(--text-secondary)] text-[var(--text-sm)]", className)}
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
    className={cn("flex items-center gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]", className)}
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
```

### Component 2: PrimaryButton

**File:** `src/components/ui/primary-button.tsx`

```tsx
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
          "transition-all duration-[var(--transition-fast)]",
          "focus-ring",

          // Colors
          "bg-[var(--primary)] text-[var(--primary-text)]",
          "hover:bg-[var(--primary-hover)]",

          // Rounded corners
          "rounded-[var(--radius-md)]",

          // Subtle shadow
          "shadow-sm",
          "hover:shadow-md",

          // Active state
          "active:scale-[0.98]",

          // Disabled
          "disabled:opacity-50",
          "disabled:cursor-not-allowed",
          "disabled:hover:bg-[var(--primary)]",
          "disabled:hover:shadow-sm",

          // Sizes
          size === "sm" && "h-9 px-3 text-[var(--text-sm)]",
          size === "md" && "h-11 px-5 text-[var(--text-base)]",
          size === "lg" && "h-12 px-6 text-[var(--text-lg)]",

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
```

### Component 3: SecondaryButton

**File:** `src/components/ui/secondary-button.tsx`

```tsx
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
        className={cn(
          // Base
          "relative inline-flex items-center justify-center gap-2",
          "font-medium",
          "transition-all duration-[var(--transition-fast)]",
          "focus-ring",
          "rounded-[var(--radius-md)]",

          // Variants
          variant === "ghost" && [
            "bg-transparent",
            "text-[var(--text-secondary)]",
            "hover:bg-[var(--surface-subtle)]",
          ],
          variant === "outline" && [
            "bg-transparent",
            "text-[var(--text-secondary)]",
            "border border-[var(--border)]",
            "hover:border-[var(--primary)]",
            "hover:text-[var(--primary)]",
            "hover:bg-[var(--primary-light)]",
          ],
          variant === "soft" && [
            "bg-[var(--surface-subtle)]",
            "text-[var(--text-secondary)]",
            "hover:bg-[var(--primary-light)]",
            "hover:text-[var(--primary)]",
          ],

          // Active
          "active:scale-[0.98]",

          // Disabled
          "disabled:opacity-50",
          "disabled:cursor-not-allowed",

          // Sizes
          size === "sm" && "h-9 px-3 text-[var(--text-sm)]",
          size === "md" && "h-11 px-5 text-[var(--text-base)]",
          size === "lg" && "h-12 px-6 text-[var(--text-lg)]",

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
```

### Component 4: PageHeading

**File:** `src/components/ui/page-heading.tsx`

```tsx
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
          <h1 className="text-[var(--text-3xl)] font-bold text-[var(--text-primary)] leading-[var(--leading-tight)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-[var(--text-base)] text-[var(--text-tertiary)]">
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
```

### Component 5: StatusBadge

**File:** `src/components/ui/status-badge.tsx`

```tsx
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
```

---

## Part 3: Layout Components

### Root Layout Updates

**File:** `src/app/layout.tsx`

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Mabel",
  description: "Preserve your family's stories for generations",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className="antialiased min-h-screen"
        style={{
          fontFamily: 'var(--font-sans)',
          backgroundColor: 'var(--background)',
          color: 'var(--text-secondary)'
        }}
      >
        {children}
      </body>
    </html>
  )
}
```

---

## Part 4: Design Principles

### 1. The "One Primary Action" Rule
**Each screen should have ONE clear primary action.**

✅ Correct:
- Dashboard: "+ New Project" is primary (blue)
- Project view: "Continue" or "Start" is primary
- All other actions are secondary (outline/ghost)

### 2. The "Warmth" Rule
**Never use pure white (#FFFFFF) for backgrounds.**

Use `--background: #FAFAFA` for warmth. Pure white feels cold and clinical.

### 3. The "Status Hierarchy" Rule
**Status should be immediately scannable.**

- Complete: Green (success)
- In Progress: Amber (active work)
- Processing: Blue (system working)
- Draft: Gray (not started)
- Error: Red (needs attention)

### 4. The "Content Respect" Rule
**UI should never compete with user content.**

- Generous whitespace around text
- Muted colors for chrome/UI
- Bold colors only for actions and status
- User content (stories, names) always in darker, more prominent text

### 5. The "Timeless Typography" Rule
**Simple sans-serif throughout for longevity.**

- No decorative fonts
- Consistent weight hierarchy
- Readable line heights
- Clear size differences between levels

---

## Part 5: Screen Patterns

### Dashboard Pattern
```tsx
<div className="min-h-screen bg-[var(--background)]">
  <header className="bg-[var(--surface)] border-b border-[var(--border)]">
    {/* App name and user menu */}
  </header>

  <main className="container-wide py-8">
    <PageHeading
      title="My Story Projects"
      action={<PrimaryButton>+ New Project</PrimaryButton>}
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StoryCard interactive variant="elevated">
        <StoryCardHeader>
          <StoryCardTitle>Mom's Childhood Memories</StoryCardTitle>
          <StatusBadge status="complete" />
        </StoryCardHeader>
        <StoryCardContent>
          <p className="text-[var(--text-tertiary)] text-sm">
            Created: Dec 15, 2025
          </p>
        </StoryCardContent>
        <StoryCardFooter>
          <SecondaryButton variant="outline">Download</SecondaryButton>
        </StoryCardFooter>
      </StoryCard>
    </div>
  </main>
</div>
```

### Auth Pattern
```tsx
<div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
  <StoryCard variant="elevated" className="max-w-md w-full">
    <div className="text-center mb-8">
      <h1 className="text-[var(--text-3xl)] font-bold text-[var(--text-primary)] mb-2">
        Welcome to Mabel!
      </h1>
      <p className="text-[var(--text-secondary)]">
        Preserve your family's stories for generations
      </p>
    </div>

    <form>
      {/* Form fields */}
      <PrimaryButton fullWidth size="lg" className="mt-6">
        Sign In
      </PrimaryButton>
    </form>
  </StoryCard>
</div>
```

---

## Part 6: Implementation Order

### Phase 1: Foundation
1. Update `globals.css` with design tokens
2. Add utility classes
3. Configure Inter font in `layout.tsx`

### Phase 2: Core Components (Priority Order)
4. `StoryCard` - Most used component
5. `PrimaryButton` - Critical for all CTAs
6. `SecondaryButton` - Secondary actions
7. `PageHeading` - Page structure
8. `StatusBadge` - Project status display

### Phase 3: Apply to Screens
9. Auth pages (Login/Register)
10. Dashboard (Project list)
11. Project detail views
12. Narrative editor

---

## Part 7: Accessibility Requirements

- [ ] All interactive elements have focus states
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [ ] All buttons have descriptive labels
- [ ] Form inputs have associated labels
- [ ] Status is conveyed through text, not just color
- [ ] Keyboard navigation works throughout
- [ ] Screen reader tested on key flows

---

## Part 8: Responsive Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
```

### Mobile Adaptations
- Stack cards vertically on mobile
- Full-width buttons on mobile
- Reduce padding/spacing at small sizes
- Collapsible navigation menu

---

## Verification Checklist

After implementation, verify:

- [ ] Background is warm off-white (#FAFAFA), not pure white
- [ ] Primary actions use blue (#4F6FFF)
- [ ] Cards have subtle shadows and borders
- [ ] Inter font loaded and applied
- [ ] All status badges display correctly
- [ ] Focus states visible on all interactive elements
- [ ] Hover states smooth (200ms transition)
- [ ] Text contrast meets accessibility standards
- [ ] Mobile responsive (375px minimum)
- [ ] No Moleskine/notebook aesthetic elements

---

**Key Difference from LLYLI Design System:**

This design system is optimized for **your actual mocks** - clean, modern, and focused on the emotional weight of personal life stories. It avoids the notebook aesthetic in favor of timeless minimalism that will age gracefully alongside the precious memories being preserved.
