"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Mic, Loader2 } from "lucide-react"

interface JournalEntry {
  id: string
  entryDate: string
  title: string | null
  narrativeText: string | null
  status: string
  wordCount: number | null
  duration: number | null
}

export default function JournalTimelinePage() {
  useSession({ required: true })
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/journal/entries")
      if (!res.ok) return

      const { data } = await res.json()
      setEntries(data)

      // If any entries are still processing, poll again
      const hasProcessing = data.some(
        (e: JournalEntry) => e.status === "PROCESSING" || e.status === "UPLOADED"
      )
      if (hasProcessing) {
        setTimeout(fetchEntries, 3000)
      }
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center pt-24">
        <div className="w-8 h-8 border-2 border-journal-text/20 border-t-journal-text rounded-full animate-spin" />
      </div>
    )
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center pt-16 pb-12">
        <div className="w-20 h-20 rounded-full bg-journal-text/5 flex items-center justify-center mb-6">
          <Mic className="w-8 h-8 text-journal-text-secondary" />
        </div>
        <h2 className="text-xl font-semibold text-journal-text mb-2">Your story begins here</h2>
        <p className="text-sm text-journal-text-secondary text-center mb-8 max-w-[280px]">
          Record your first voice journal entry and watch it transform into narrative prose.
        </p>
        <button
          onClick={() => router.push("/journal/record")}
          className="px-6 py-3 rounded-full bg-journal-text text-white font-medium
            hover:bg-black active:scale-[0.98] transition-all duration-200"
        >
          Record your first entry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-24">
      {/* Stats bar */}
      <div className="flex items-center justify-between py-4 mb-2">
        <p className="text-sm text-journal-text-secondary">
          {entries.filter((e) => e.status === "COMPLETE").length} {entries.length === 1 ? "entry" : "entries"}
        </p>
        <p className="text-sm text-journal-text-secondary">
          {entries.reduce((sum, e) => sum + (e.wordCount || 0), 0).toLocaleString()} words
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {entries.map((entry) => (
          <article key={entry.id} className="relative">
            {/* Processing state */}
            {(entry.status === "PROCESSING" || entry.status === "UPLOADED") && (
              <div className="bg-white rounded-2xl border border-journal-border/50 p-5">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-journal-text-secondary animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-sm text-journal-text">Processing your recording...</p>
                    <p className="text-xs text-journal-text-secondary mt-0.5">
                      {formatShortDate(entry.entryDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Complete state */}
            {entry.status === "COMPLETE" && (
              <div className="bg-white rounded-2xl border border-journal-border/50 p-5">
                {/* Title and date */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-journal-text leading-tight font-caveat">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-journal-text-secondary mt-1">
                    {formatDate(entry.entryDate)}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-8 h-px bg-journal-border mb-3" />

                {/* Narrative text */}
                <div className="text-sm text-journal-text leading-relaxed whitespace-pre-wrap">
                  {entry.narrativeText}
                </div>

                {/* Word count */}
                {entry.wordCount && (
                  <p className="text-xs text-journal-text-secondary mt-4">
                    {entry.wordCount} words
                  </p>
                )}
              </div>
            )}

            {/* Error state */}
            {entry.status === "ERROR" && (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
                <p className="text-sm text-red-600">
                  Something went wrong processing this entry.
                </p>
                <p className="text-xs text-red-400 mt-1">
                  {formatShortDate(entry.entryDate)}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Floating record button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={() => router.push("/journal/record")}
          className="w-14 h-14 rounded-full bg-journal-text text-white shadow-lg
            flex items-center justify-center
            hover:bg-black active:scale-95 transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-journal-text/20"
          aria-label="New journal entry"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
