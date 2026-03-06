"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Mic, PenLine } from "lucide-react"
import { AudioRecorder } from "@/components/journal"

const PROMPTS = [
  "What are your favorite family traditions?",
  "Describe your childhood home.",
  "Tell me about when you first met Grandma.",
  "What's a memory that always makes you smile?",
  "Tell me about a person who changed your life.",
  "What was a turning point in your story?",
  "Describe a place that feels like home.",
  "What's a lesson you learned the hard way?",
  "What traditions matter most to you?",
  "What's the bravest thing you've ever done?",
]

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default function JournalRecordPage() {
  useSession({ required: true })
  const router = useRouter()

  const [projectId, setProjectId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Two phases: "select" (prompt selection) and "recording" (active recording)
  const [phase, setPhase] = useState<"select" | "recording">("select")
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>()
  const [suggestions] = useState(() => pickRandom(PROMPTS, 3))

  // Text input mode
  const [showWriteInput, setShowWriteInput] = useState(false)
  const [writeText, setWriteText] = useState("")
  const [isSubmittingText, setIsSubmittingText] = useState(false)

  // Load the user's project
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

  // Start recording with an optional prompt
  const startRecording = useCallback((prompt?: string) => {
    setSelectedPrompt(prompt)
    setPhase("recording")
  }, [])

  // After recording completes, return to prompt selection
  const handleEntrySubmitted = useCallback(() => {
    setSelectedPrompt(undefined)
    setPhase("select")
  }, [])

  // Submit typed text as a journal entry
  const handleSubmitText = async () => {
    if (!writeText.trim() || !projectId) return
    setIsSubmittingText(true)
    try {
      const res = await fetch("/api/journal/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          promptText: "Written entry",
          textContent: writeText.trim(),
        }),
      })
      if (!res.ok) throw new Error("Failed to save entry")
      setWriteText("")
      setShowWriteInput(false)
      router.push("/journal")
    } catch {
      setError("Failed to save your entry. Please try again.")
    } finally {
      setIsSubmittingText(false)
    }
  }

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

  // Phase 2: Active recording
  if (phase === "recording") {
    return (
      <div className="h-[calc(100dvh-60px)] md:h-[calc(90vh-80px)] md:max-h-[680px]">
        <AudioRecorder
          projectId={projectId}
          prompt={selectedPrompt}
          onEntrySubmitted={handleEntrySubmitted}
          onError={(msg) => setError(msg)}
        />
      </div>
    )
  }

  // Phase 1: Prompt selection
  return (
    <div className="flex flex-col h-[calc(100dvh-52px)] md:h-[calc(90vh-72px)] md:max-h-[700px]">
      {/* Back button */}
      <div className="pt-1 pb-2 flex-shrink-0">
        <button
          onClick={() => router.push("/journal")}
          className="w-8 h-8 rounded-full bg-journal-text/5 flex items-center justify-center
            hover:bg-journal-text/10 active:scale-95 transition-all"
          aria-label="Back to journal"
        >
          <ChevronLeft className="w-5 h-5 text-journal-text" />
        </button>
      </div>

      {/* Heading */}
      <div className="text-center flex-shrink-0">
        <h1 className="text-2xl font-bold text-journal-text leading-tight">
          What story would you like to tell?
        </h1>
        <p className="text-sm text-journal-text-secondary mt-1.5">
          Tap the button and start speaking.
        </p>
      </div>

      {/* Mic button */}
      <div className="flex justify-center py-5 flex-shrink-0">
        <button
          onClick={() => startRecording()}
          className="w-20 h-20 rounded-full bg-journal-text flex items-center justify-center
            hover:bg-black active:scale-95 transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-journal-text/20"
          aria-label="Start recording"
        >
          <Mic className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* Or write here */}
      <div className="flex justify-end mb-4 flex-shrink-0">
        {!showWriteInput ? (
          <button
            onClick={() => setShowWriteInput(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-journal-text/5
              text-sm text-journal-text-secondary hover:bg-journal-text/10 transition-colors"
          >
            <PenLine className="w-3.5 h-3.5" />
            Or write here
          </button>
        ) : (
          <div className="w-full">
            <textarea
              value={writeText}
              onChange={(e) => setWriteText(e.target.value)}
              placeholder="Write your story..."
              autoFocus
              className="w-full h-24 px-4 py-3 rounded-xl bg-journal-input-bg border border-journal-border
                text-sm text-journal-text placeholder:text-journal-text-secondary/60
                focus:outline-none focus:ring-2 focus:ring-journal-text/20 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={() => { setShowWriteInput(false); setWriteText("") }}
                className="text-sm text-journal-text-secondary hover:text-journal-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitText}
                disabled={!writeText.trim() || isSubmittingText}
                className="px-4 py-2 rounded-full bg-journal-text text-white text-sm font-medium
                  hover:bg-black active:scale-95 transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingText ? "Saving..." : "Save entry"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions — fills remaining space */}
      <div className="flex-1 min-h-0 flex flex-col">
        <h2 className="text-base font-semibold text-journal-text mb-2 flex-shrink-0">
          Suggestions
        </h2>
        <div className="space-y-2 flex-1 min-h-0">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => startRecording(suggestion)}
              className="w-full text-left px-4 py-3 rounded-xl bg-journal-input-bg
                border border-journal-border/50 text-sm text-journal-text
                hover:border-journal-border hover:bg-journal-border/20
                active:scale-[0.98] transition-all duration-150"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
