"use client"

import { useEffect, useState, useCallback } from "react"
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

// Shuffle prompts so each session feels fresh
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function JournalRecordPage() {
  useSession({ required: true })
  const router = useRouter()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Question cycling state
  const [prompts] = useState(() => shuffleArray(PROMPTS))
  const [promptIndex, setPromptIndex] = useState(0)
  const [ghostText, setGhostText] = useState("")

  // The boilerplate that was "typed out" during the last recording — becomes ghost text
  const BOILERPLATE = `I remember sitting in my grandmother's kitchen, watching her bake apple pie. The warm smell of cinnamon filled the whole house, and she would let me help roll out the dough. Those afternoons felt like they could last forever, just the two of us in that warm little kitchen with flour on our hands and love in the air.`

  // Find or verify the user's journal project
  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch("/api/projects?limit=1")
        if (!res.ok) throw new Error("Failed to load project")

        const { data } = await res.json()
        if (data.length === 0) {
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

  // Called when user finishes recording and fade completes — cycle to next question
  const handleEntrySubmitted = useCallback(() => {
    // The boilerplate that just faded becomes the ghost text for the next question
    setGhostText(BOILERPLATE)

    // Advance to next prompt (loop back to start if exhausted)
    setPromptIndex((prev) => (prev + 1) % prompts.length)
  }, [prompts.length, BOILERPLATE])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-24">
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
    <div className="h-[calc(100dvh-60px)] md:h-[calc(90vh-80px)] md:max-h-[680px]">
      <AudioRecorder
        projectId={projectId}
        prompt={prompts[promptIndex]}
        ghostText={ghostText}
        onEntrySubmitted={handleEntrySubmitted}
        onError={(msg) => setError(msg)}
      />
    </div>
  )
}
