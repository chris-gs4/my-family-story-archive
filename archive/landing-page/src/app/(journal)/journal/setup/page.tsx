"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { JournalPillButton, JournalCtaButton } from "@/components/journal"

const TOPICS = ["Childhood", "Family", "Career", "Travel", "Life Lessons", "Milestones"] as const

export default function JournalSetupPage() {
  useSession({ required: true })
  const router = useRouter()

  const [name, setName] = useState("")
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const canSubmit = name.trim() && selectedTopics.length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsLoading(true)
    setError("")

    try {
      // Create project
      const projectRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `${name.trim()}'s Journal` }),
      })
      if (!projectRes.ok) {
        const data = await projectRes.json()
        throw new Error(data.error || "Failed to create project")
      }
      const { data: project } = await projectRes.json()

      // Save interviewee info (reusing existing model for user profile)
      const intervieweeRes = await fetch(`/api/projects/${project.id}/interviewee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          relationship: "self",
          topics: selectedTopics,
        }),
      })
      if (!intervieweeRes.ok) {
        const data = await intervieweeRes.json()
        throw new Error(data.error || "Failed to save profile")
      }

      // Redirect to first recording
      router.push("/journal/record")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col pt-4 pb-12">
      <h1 className="text-2xl font-bold text-journal-text mb-1">Set up your journal</h1>
      <p className="text-journal-text-secondary text-sm mb-8">
        Tell us a bit about yourself to personalize your experience.
      </p>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Name input */}
      <div className="mb-8">
        <label htmlFor="name" className="block text-sm font-medium text-journal-text mb-2">
          Your name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rose"
          className="w-full px-4 py-3 rounded-xl bg-journal-input-bg border border-journal-border
            text-journal-text placeholder:text-journal-text-secondary/60
            focus:outline-none focus:ring-2 focus:ring-journal-text/20 focus:border-journal-text/40
            transition-all duration-200"
        />
      </div>

      {/* Topics */}
      <div className="mb-10">
        <label className="block text-sm font-medium text-journal-text mb-1">
          What would you like to write about?
        </label>
        <p className="text-xs text-journal-text-secondary mb-3">
          Select all that interest you
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {TOPICS.map((topic) => (
            <JournalPillButton
              key={topic}
              label={topic}
              selected={selectedTopics.includes(topic)}
              onClick={() => toggleTopic(topic)}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Submit */}
      <JournalCtaButton
        onClick={handleSubmit}
        loading={isLoading}
        disabled={!canSubmit}
      >
        Start Journaling
      </JournalCtaButton>
    </div>
  )
}
