import { JournalHeader } from "@/components/journal"

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-200 flex items-start md:items-center justify-center md:py-4">
      {/* iPhone shell — only visible on md+ screens, scales to fit viewport */}
      <div
        className="
          relative w-full max-w-[360px]
          md:rounded-[44px] md:border-[7px] md:border-[#1a1a1a]
          md:shadow-[0_20px_60px_rgba(0,0,0,0.3)]
          md:h-[780px] md:max-h-[90vh]
          h-screen
          overflow-hidden
          bg-mabel-gradient
        "
      >
        {/* Dynamic Island — hidden on small screens */}
        <div className="hidden md:flex justify-center pt-2 pb-0 relative z-20">
          <div className="w-[110px] h-[30px] bg-[#1a1a1a] rounded-full" />
        </div>

        {/* Scrollable content area */}
        <div className="h-full overflow-y-auto overflow-x-hidden">
          <div className="px-6">
            <JournalHeader />
            {children}
          </div>
        </div>

        {/* Home indicator bar */}
        <div className="hidden md:flex justify-center pb-2 pt-1 absolute bottom-0 left-0 right-0 z-20">
          <div className="w-[134px] h-[5px] bg-journal-text/20 rounded-full" />
        </div>
      </div>
    </div>
  )
}
