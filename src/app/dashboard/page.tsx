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
import { Plus, Clock, FileText } from "lucide-react"

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
              New Project
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
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>8,245 words • 45 min read</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Created Dec 15, 2025</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Stories about growing up in small-town America during the 1960s
                </p>
              </div>
            </StoryCardContent>
            <StoryCardFooter>
              <SecondaryButton variant="outline" size="sm">
                Download PDF
              </SecondaryButton>
            </StoryCardFooter>
          </StoryCard>

          {/* Project 2 - Complete */}
          <StoryCard interactive variant="elevated">
            <StoryCardHeader>
              <StoryCardTitle>Dad's Career Journey</StoryCardTitle>
              <StatusBadge status="complete" />
            </StoryCardHeader>
            <StoryCardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>12,150 words • 60 min read</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Created Dec 10, 2025</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  From first job to retirement - 40 years of engineering excellence
                </p>
              </div>
            </StoryCardContent>
            <StoryCardFooter>
              <SecondaryButton variant="outline" size="sm">
                Download PDF
              </SecondaryButton>
            </StoryCardFooter>
          </StoryCard>

          {/* Project 3 - Processing */}
          <StoryCard variant="default">
            <StoryCardHeader>
              <StoryCardTitle>Grandma's Immigration Story</StoryCardTitle>
              <StatusBadge status="processing" />
            </StoryCardHeader>
            <StoryCardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Generating narrative from interview transcript...
                </p>
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: "75%" }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">75% complete</p>
              </div>
            </StoryCardContent>
          </StoryCard>

          {/* Project 4 - In Progress */}
          <StoryCard interactive variant="default">
            <StoryCardHeader>
              <StoryCardTitle>Uncle Joe's Military Service</StoryCardTitle>
              <StatusBadge status="recording" />
            </StoryCardHeader>
            <StoryCardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Started Jan 8, 2026</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Recording interviews about Vietnam War experiences
                </p>
              </div>
            </StoryCardContent>
            <StoryCardFooter>
              <PrimaryButton size="sm">Continue Interview</PrimaryButton>
            </StoryCardFooter>
          </StoryCard>

          {/* Project 5 - Draft */}
          <StoryCard interactive variant="default">
            <StoryCardHeader>
              <StoryCardTitle>Aunt Marie's Teaching Years</StoryCardTitle>
              <StatusBadge status="draft" />
            </StoryCardHeader>
            <StoryCardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Created Jan 10, 2026</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  35 years of teaching elementary school - ready to start
                </p>
              </div>
            </StoryCardContent>
            <StoryCardFooter>
              <PrimaryButton size="sm">Start Project</PrimaryButton>
            </StoryCardFooter>
          </StoryCard>

          {/* Project 6 - Processing (Transcription) */}
          <StoryCard variant="default">
            <StoryCardHeader>
              <StoryCardTitle>Grandpa's Woodworking Legacy</StoryCardTitle>
              <StatusBadge status="processing" />
            </StoryCardHeader>
            <StoryCardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Transcribing 90-minute interview...
                </p>
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: "45%" }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">45% complete • 3 min remaining</p>
              </div>
            </StoryCardContent>
          </StoryCard>
        </div>
      </main>
    </div>
  )
}
