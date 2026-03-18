const steps = [
  {
    number: 1,
    title: "Just Talk",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2E7D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    description:
      "Tap record and speak naturally. Tell Mabel about your childhood, your career, your love story \u2014 whatever chapter of your life you want to capture.",
  },
  {
    number: 2,
    title: "Mabel Writes",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2E7D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </svg>
    ),
    description:
      "Mabel transcribes your voice and transforms your spoken words into polished, beautifully written narrative prose. Like having a skilled biographer who truly listens.",
  },
  {
    number: 3,
    title: "Your Memoir",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2E7D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        <path d="M8 7h6" />
        <path d="M8 11h8" />
      </svg>
    ),
    description:
      "Build your story chapter by chapter. Each conversation becomes part of your personal memoir. Export as a professional PDF to share with family.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-mabel-bg-alt px-6 py-12 sm:py-20">
      <div className="mx-auto max-w-[800px]">
        <h2 className="mb-4 text-center text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
          How It Works
        </h2>
        <p className="mb-14 text-center text-base leading-relaxed sm:text-lg">
          Three simple steps to your personal memoir.
        </p>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-xl border border-[rgba(0,0,0,0.08)] bg-mabel-bg px-6 pt-12 pb-8 text-center"
            >
              {/* Step number badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[#2E7D6B] text-sm font-bold text-white">
                {step.number}
              </div>

              {/* Icon */}
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0faf7]">
                {step.icon}
              </div>

              <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
              <p className="text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
