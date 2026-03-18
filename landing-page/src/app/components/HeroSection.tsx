import Image from "next/image";
import WaitlistForm from "./WaitlistForm";

export default function HeroSection() {
  return (
    <section
      id="waitlist"
      className="relative flex min-h-screen flex-col items-center justify-center bg-mabel-bg px-6 pt-28 pb-16 scroll-mt-20"
    >
      {/* Mascot */}
      <div className="relative mb-8">
        <div className="absolute inset-0 -m-16 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, #ede8e3 0%, transparent 70%)" }} aria-hidden="true" />
        <Image
          src="/images/mabel-mascot.png"
          alt="Mabel, a warm pixel-art grandmother character sitting in an armchair, writing with a quill pen"
          width={480}
          height={480}
          className="relative h-80 w-80 sm:h-96 sm:w-96 lg:h-[28rem] lg:w-[28rem]"
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      {/* Headline */}
      <h1 className="mb-4 text-center text-3xl font-extrabold leading-tight tracking-[-0.02em] text-balance sm:text-4xl lg:text-5xl">
        Speak Your Memoir Into Existence.
      </h1>

      {/* Subtitle */}
      <p className="mb-3 text-center text-lg font-medium sm:text-xl">
        Your memoir companion.
        <br />
        Just talk — Mabel writes.
      </p>

      {/* Trust indicators */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#f0faf7] text-sm font-medium text-mabel-text" style={{ border: "1.5px solid #2E7D6B", padding: "10px 18px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
          No writing required
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#f0faf7] text-sm font-medium text-mabel-text" style={{ border: "1.5px solid #2E7D6B", padding: "10px 18px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          </svg>
          Voice-first
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#f0faf7] text-sm font-medium text-mabel-text" style={{ border: "1.5px solid #2E7D6B", padding: "10px 18px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Private &amp; secure
        </span>
      </div>

      {/* Body */}
      <p className="mb-8 max-w-lg text-center text-base leading-relaxed sm:text-lg">
        Record your memories by voice. Mabel interviews you like a skilled
        biographer, then transforms your words into a beautifully written story.
      </p>

      {/* Waitlist form */}
      <div className="mb-6 w-full max-w-md">
        <WaitlistForm />
      </div>

      <p className="text-sm font-medium italic text-mabel-text/60">
        Everyone&apos;s stories deserve to be heard.
      </p>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 animate-bounce" aria-hidden="true">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-mabel-text/30"
          aria-hidden="true"
        >
          <path
            d="M12 5v14M5 12l7 7 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
