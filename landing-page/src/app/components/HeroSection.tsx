import Image from "next/image";
import WaitlistForm from "./WaitlistForm";

export default function HeroSection() {
  return (
    <section
      id="waitlist"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16 scroll-mt-20"
    >
      {/* Mascot with warm glow */}
      <div className="relative mb-8">
        {/* Radial gold glow behind mascot */}
        <div className="absolute inset-0 -m-16 rounded-full bg-mabel-gold/15 blur-3xl" aria-hidden="true" />
        <Image
          src="/images/mabel-mascot.png"
          alt="Mabel, a warm pixel-art grandmother character sitting in an armchair, writing with a quill pen"
          width={320}
          height={320}
          className="relative h-56 w-56 sm:h-72 sm:w-72 lg:h-80 lg:w-80"
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      {/* Copy */}
      <h1 className="mb-4 text-center text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl">
        Speak Your Memoir Into Existence.
      </h1>

      <p className="mb-3 text-center text-lg font-medium text-mabel-greeting sm:text-xl">
        Your memoir companion. Just talk — Mabel writes.
      </p>

      <p className="mb-8 max-w-lg text-center text-mabel-subtle">
        Record your memories by voice. Mabel interviews you like a skilled
        biographer, then transforms your words into a beautifully written story.
        No writing required.
      </p>

      {/* Waitlist form */}
      <div className="mb-6 w-full max-w-md">
        <WaitlistForm />
      </div>

      <p className="text-sm font-medium text-mabel-greeting italic">
        Everyone&apos;s stories deserve to be heard.
      </p>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 animate-bounce" aria-hidden="true">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-mabel-subtle/50"
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
