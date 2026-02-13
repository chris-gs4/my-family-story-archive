import { BookOpen } from "lucide-react"

export function JournalHeader() {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <BookOpen className="w-5 h-5 text-journal-text" />
      <span className="text-lg font-semibold text-journal-text tracking-tight">
        Journal
      </span>
    </div>
  )
}
