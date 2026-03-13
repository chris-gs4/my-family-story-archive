import Image from "next/image";

const benefits = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      </svg>
    ),
    text: "Record anytime, anywhere \u2014 during your morning walk, over coffee",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    text: "AI questions that learn from your story and get smarter each chapter",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      </svg>
    ),
    text: "Beautifully written narratives from your own words",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    text: "Work at your own pace \u2014 minutes a day, over weeks or months",
  },
];

export default function ForStorytellers() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text content */}
          <div>
            <p className="mb-2 text-sm font-bold tracking-widest text-mabel-teal uppercase">
              For Storytellers
            </p>
            <h2 className="mb-4 text-2xl font-bold text-balance sm:text-3xl">
              Your Life Story, Effortlessly
            </h2>
            <p className="mb-6 text-mabel-subtle leading-relaxed">
              Writing a memoir sounds daunting. Talking to Mabel doesn&apos;t. She
              interviews you chapter by chapter, asking thoughtful questions that
              draw out memories you&apos;d forgotten. No blank pages. No
              writer&apos;s block. Just your voice and your memories.
            </p>

            <ul className="space-y-4">
              {benefits.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-mabel-teal">{item.icon}</span>
                  <span className="text-sm leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* App mockup */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="overflow-hidden rounded-[36px] border-[8px] border-mabel-text/10 bg-mabel-text/5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <Image
                  src="/images/app-screens/screen3-recording.png"
                  alt="Mabel app recording screen showing guided interview questions"
                  width={280}
                  height={560}
                  className="h-auto w-56 sm:w-64"
                  style={{ objectFit: "cover" }}
                />
              </div>
              {/* Decorative glow */}
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-mabel-gold/20 blur-2xl" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
