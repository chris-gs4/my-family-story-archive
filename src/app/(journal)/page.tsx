"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { BookOpen, Mic } from "lucide-react"
import { JournalCtaButton } from "@/components/journal"

export default function JournalOnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // If already authenticated, check if they have a project and redirect
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/projects?limit=1")
        .then((res) => res.json())
        .then(({ data }) => {
          if (data && data.length > 0) {
            router.push("/journal")
          }
        })
        .catch(() => {})
    }
  }, [status, router])

  const handleGetStarted = () => {
    if (session) {
      router.push("/journal/setup")
    } else {
      router.push("/auth/signup?callbackUrl=/journal/setup")
    }
  }

  return (
    <div className="flex flex-col items-center pt-8 pb-12">
      {/* Book illustration area */}
      <div className="relative w-48 h-56 mb-8 flex items-center justify-center">
        {/* Book shape */}
        <div className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-journal-border/50 flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-journal-border" strokeWidth={1} />
        </div>
        {/* Mic overlay */}
        <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-journal-text rounded-full flex items-center justify-center shadow-md">
          <Mic className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-journal-text text-center mb-3 font-caveat">
        Tell your story
      </h1>
      <p className="text-journal-text-secondary text-center text-base mb-10 max-w-[320px]">
        Record short voice memos and watch them transform into a beautiful written memoir, one entry at a time.
      </p>

      {/* CTA */}
      <div className="w-full">
        <JournalCtaButton onClick={handleGetStarted}>
          Get Started
        </JournalCtaButton>
      </div>

      {/* Sign in link for unauthenticated users */}
      {!session && (
        <p className="text-sm text-journal-text-secondary mt-6">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/auth/signin?callbackUrl=/journal")}
            className="text-journal-text font-medium underline underline-offset-2"
          >
            Sign in
          </button>
        </p>
      )}
    </div>
  )
}
