"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AudioRecorder } from "@/components/journal"

const PROMPTS = [
  "What's a memory that always makes you smile?",
  "Tell me about a person who changed your life.",
  "What was a turning point in your story?",
  "Describe a place that feels like home.",
  "What's a lesson you learned the hard way?",
  "What traditions matter most to you?",
  "What's the bravest thing you've ever done?",
  "Tell me about a time you surprised yourself.",
  "What's a moment you wish you could relive?",
  "What do you want people to know about you?",
]

export default function JournalRecordPage() {
  useSession({ required: true })
  const router = useRouter()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)])

  // Find or verify the user's journal project
  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch("/api/projects?limit=1")
        if (!res.ok) throw new Error("Failed to load project")

        const { data } = await res.json()
        if (data.length === 0) {
          // No project yet, redirect to setup
          router.push("/journal/setup")
          return
        }

        setProjectId(data[0].id)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setIsLoading(false)
      }
    }
    loadProject()
  }, [router])

  const handleComplete = () => {
    router.push("/journal")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center pt-24">
        <div className="w-8 h-8 border-2 border-journal-text/20 border-t-journal-text rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center pt-12 px-4">
        <p className="text-red-600 text-sm text-center">{error}</p>
        <button
          onClick={() => router.push("/journal/setup")}
          className="mt-4 text-sm text-journal-text underline underline-offset-2"
        >
          Set up your journal
        </button>
      </div>
    )
  }

  if (!projectId) return null

  return (
    <div className="flex flex-col items-center pt-8 pb-12">
      {/* Prompt */}
      <div className="text-center mb-12 px-4">
        <p className="text-xs uppercase tracking-wider text-journal-text-secondary mb-3">
          Today&apos;s prompt
        </p>
        <h2 className="text-xl font-semibold text-journal-text leading-relaxed font-caveat">
          {prompt}
        </h2>
        <p className="text-xs text-journal-text-secondary mt-3">
          Or talk about anything on your mind
        </p>
      </div>

      {/* Recorder */}
      <AudioRecorder
        projectId={projectId}
        promptText={prompt}
        onComplete={handleComplete}
        onError={(msg) => setError(msg)}
      />
    </div>
  )
}
