import Link from "next/link"
import { PrimaryButton, SecondaryButton } from "@/components/ui"
import { BookHeart, Mic, FileText, Headphones } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container-wide py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Family Story Archive
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Preserve your family's stories for generations. Transform interviews into
            written narratives and audiobooks using AI.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <PrimaryButton size="lg">
                Get Started
              </PrimaryButton>
            </Link>
            <Link href="/auth/signin">
              <button className="h-12 px-6 text-lg font-medium rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-150 active:scale-[0.98]">
                Sign In
              </button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mic className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">AI-Guided Interviews</h3>
            <p className="text-sm text-muted-foreground">
              Get personalized questions tailored to your family member's story
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Auto Transcription</h3>
            <p className="text-sm text-muted-foreground">
              Automatically convert audio recordings to accurate transcripts
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookHeart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Narrative Generation</h3>
            <p className="text-sm text-muted-foreground">
              Transform interviews into beautifully written stories
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Voice Cloning</h3>
            <p className="text-sm text-muted-foreground">
              Create audiobooks with your loved one's voice
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container-wide text-center text-sm text-muted-foreground">
          <p>Family Story Archive - Preserve memories for generations</p>
        </div>
      </footer>
    </div>
  )
}
