const benefits = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      </svg>
    ),
    text: "Record anytime, anywhere \u2014 during your morning walk, over coffee",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    text: "AI questions that learn from your story and get smarter each chapter",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      </svg>
    ),
    text: "Beautifully written narratives from your own words",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
      </svg>
    ),
    text: "Work at your own pace \u2014 minutes a day, over weeks or months",
  },
];

export default function ForStorytellers() {
  return (
    <section className="bg-mabel-bg px-6 py-12 sm:py-20">
      <div className="mx-auto max-w-[800px] text-center">
        <p className="mb-2 text-sm font-semibold tracking-[0.08em] text-mabel-primary uppercase">
          For Storytellers
        </p>
        <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
          Your Life Story, Effortlessly
        </h2>
        <p className="mb-10 text-base leading-relaxed sm:text-lg">
          Writing a memoir sounds daunting. Talking to Mabel doesn&apos;t. She
          interviews you chapter by chapter, asking thoughtful questions that
          draw out memories you&apos;d forgotten. No blank pages. No
          writer&apos;s block. Just your voice and your memories.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 text-left">
          {benefits.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl bg-white px-5 py-4"
              style={{ border: "1.5px solid #e8e0da", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <span className="mt-0.5 shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#f0faf7] text-[#2E7D6B]">{item.icon}</span>
              <span className="text-sm font-medium leading-relaxed sm:text-base">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
