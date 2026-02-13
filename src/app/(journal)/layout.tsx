import { JournalHeader } from "@/components/journal"

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-journal-bg">
      <div className="mx-auto w-full max-w-[480px] px-6">
        <JournalHeader />
        {children}
      </div>
    </div>
  )
}
