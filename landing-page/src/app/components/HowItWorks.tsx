const steps = [
  {
    number: 1,
    title: "Just Talk",
    emoji: "\uD83C\uDF99\uFE0F",
    description:
      "Tap record and speak naturally. Tell Mabel about your childhood, your career, your love story \u2014 whatever chapter of your life you want to capture.",
  },
  {
    number: 2,
    title: "Mabel Writes",
    emoji: "\u2728",
    description:
      "Mabel transcribes your voice and transforms your spoken words into polished, beautifully written narrative prose. Like having a skilled biographer who truly listens.",
  },
  {
    number: 3,
    title: "Your Memoir",
    emoji: "\uD83D\uDCD6",
    description:
      "Build your story chapter by chapter. Each conversation becomes part of your personal memoir. Export as a professional PDF to share with family.",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center text-2xl font-bold text-balance sm:text-3xl">
          How It Works
        </h2>
        <p className="mb-14 text-center text-mabel-subtle">
          Three simple steps to your personal memoir.
        </p>

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-[20px] bg-mabel-surface px-8 pt-14 pb-10 shadow-[0_4px_12px_rgba(0,0,0,0.06)] text-center"
            >
              {/* Step number badge — overlapping top-left */}
              <div className="absolute -top-4 -left-2 flex h-10 w-10 items-center justify-center rounded-full bg-mabel-teal text-sm font-bold text-white shadow-[0_2px_8px_rgba(31,122,111,0.3)]">
                {step.number}
              </div>

              {/* Centered emoji icon in circular bg */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-mabel-text/5">
                <span className="text-3xl" aria-hidden="true">{step.emoji}</span>
              </div>

              <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-mabel-subtle">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
