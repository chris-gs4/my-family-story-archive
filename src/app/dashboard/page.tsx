import {
  PageHeading,
  PrimaryButton,
  SecondaryButton,
  StoryCard,
  StoryCardHeader,
  StoryCardTitle,
  StoryCardContent,
  StoryCardFooter,
  StatusBadge,
} from "@/components/ui"
import { Plus } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container-wide py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Family Story Archive</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Sarah M</span>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">SM</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-8">
        <PageHeading
          title="My Story Projects"
          subtitle="Preserve your family's stories for generations"
          action={
            <PrimaryButton icon={<Plus className="w-4 h-4" />}>
              + New Project
            </PrimaryButton>
          }
        />

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project 1 - Complete */}
          <StoryCard interactive variant="elevated">
            <StoryCardHeader>
              <StoryCardTitle>Mom's Childhood Memories</StoryCardTitle>
              <StatusBadge status="complete" />
            </StoryCardHeader>
            <StoryCardContent>
              <p className="text-muted-foreground mb-2">
                Status: Audiobook Ready
              </p>
              <p className="text-sm text-muted-foreground">
                Created: Dec 15, 2025
              </p>
            </StoryCardContent>
            <StoryCardFooter>
              <SecondaryButton variant="outline" size="sm">
                Download
              </SecondaryButton>
            </StoryCardFooter>
          </StoryCard>

          {/* Project 2 - Complete */}
          <StoryCard interactive variant="elevated">
            <StoryCardHeader>
              <StoryCardTitle>Dad's Military Service</StoryCardTitle>
              <StatusBadge status="complete">Audiobook Ready</StatusBadge>
            </StoryCardHeader>
            <StoryCardContent>
              <p className="text-muted-foreground mb-2">
                Status: Audiobook Ready
              </p>
              <p className="text-sm text-muted-foreground">
                Created: Dec 10, 2025
              </p>
            </StoryCardContent>
            <StoryCardFooter>
              <SecondaryButton variant="outline" size="sm">
                Download
              </SecondaryButton>
            </StoryCardFooter>
          </StoryCard>

          {/* Project 3 - Draft */}
          <StoryCard interactive variant="default">
            <StoryCardHeader>
              <StoryCardTitle>Grandma's Immigration Story</StoryCardTitle>
              <StatusBadge status="draft">Ready to Start</StatusBadge>
            </StoryCardHeader>
            <StoryCardContent>
              <p className="text-muted-foreground mb-2">
                Status: Ready to Start
              </p>
              <p className="text-sm text-muted-foreground">
                Created: Dec 22, 2025
              </p>
            </StoryCardContent>
            <StoryCardFooter>
              <PrimaryButton size="sm">Start</PrimaryButton>
            </StoryCardFooter>
          </StoryCard>

          {/* Project 4 - Processing */}
          <StoryCard variant="default">
            <StoryCardHeader>
              <StoryCardTitle>Uncle John's Stories</StoryCardTitle>
              <StatusBadge status="processing">Processing</StatusBadge>
            </StoryCardHeader>
            <StoryCardContent>
              <p className="text-muted-foreground mb-2">
                Transcribing audio...
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">65% complete</p>
            </StoryCardContent>
          </StoryCard>

          {/* Project 5 - In Progress */}
          <StoryCard variant="default">
            <StoryCardHeader>
              <StoryCardTitle>Family Holiday Traditions</StoryCardTitle>
              <StatusBadge status="recording">In Progress</StatusBadge>
            </StoryCardHeader>
            <StoryCardContent>
              <p className="text-muted-foreground mb-2">
                Interview in progress
              </p>
              <p className="text-sm text-muted-foreground">
                Created: Jan 5, 2026
              </p>
            </StoryCardContent>
            <StoryCardFooter>
              <PrimaryButton size="sm">Continue</PrimaryButton>
            </StoryCardFooter>
          </StoryCard>

          {/* Project 6 - Error */}
          <StoryCard variant="default">
            <StoryCardHeader>
              <StoryCardTitle>Grandpa's War Stories</StoryCardTitle>
              <StatusBadge status="error">Error</StatusBadge>
            </StoryCardHeader>
            <StoryCardContent>
              <p className="text-destructive mb-2">
                Transcription failed
              </p>
              <p className="text-sm text-muted-foreground">
                Audio file format not supported
              </p>
            </StoryCardContent>
            <StoryCardFooter>
              <SecondaryButton variant="outline" size="sm">
                Re-upload Audio
              </SecondaryButton>
            </StoryCardFooter>
          </StoryCard>
        </div>

        {/* Component Showcase Section */}
        <div className="mt-12 border-t border-border pt-12">
          <h2 className="text-2xl font-bold mb-6">Component Showcase</h2>

          {/* Buttons */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <PrimaryButton size="sm">Small Primary</PrimaryButton>
              <PrimaryButton size="md">Medium Primary</PrimaryButton>
              <PrimaryButton size="lg">Large Primary</PrimaryButton>
              <PrimaryButton loading>Loading</PrimaryButton>
              <SecondaryButton variant="outline">Outline</SecondaryButton>
              <SecondaryButton variant="ghost">Ghost</SecondaryButton>
              <SecondaryButton variant="soft">Soft</SecondaryButton>
            </div>
          </div>

          {/* Status Badges */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Status Badges</h3>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="draft" />
              <StatusBadge status="recording" />
              <StatusBadge status="processing" />
              <StatusBadge status="complete" />
              <StatusBadge status="error" />
            </div>
          </div>

          {/* Cards */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Card Variants</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StoryCard variant="default">
                <StoryCardTitle>Default Card</StoryCardTitle>
                <StoryCardContent>
                  <p className="mt-2">With border and subtle background</p>
                </StoryCardContent>
              </StoryCard>
              <StoryCard variant="elevated">
                <StoryCardTitle>Elevated Card</StoryCardTitle>
                <StoryCardContent>
                  <p className="mt-2">With shadow for depth</p>
                </StoryCardContent>
              </StoryCard>
              <StoryCard variant="outlined">
                <StoryCardTitle>Outlined Card</StoryCardTitle>
                <StoryCardContent>
                  <p className="mt-2">With heavier border, transparent bg</p>
                </StoryCardContent>
              </StoryCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
