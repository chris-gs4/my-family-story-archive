import WaitlistForm from "./WaitlistForm";

export default function FinalCTA() {
  return (
    <section className="bg-mabel-bg px-6 py-12 sm:py-20">
      <div className="mx-auto flex max-w-[800px] flex-col items-center text-center">
        <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
          Everyone&apos;s Stories Deserve to Be Heard.
        </h2>

        <p className="mb-8 text-base leading-relaxed sm:text-lg">
          Join the waitlist and be the first to speak your memoir into existence.
        </p>

        <WaitlistForm variant="compact" />

        <p className="mt-6 text-sm text-[#2d2c2b]">
          No spam. Just the story of a lifetime.
        </p>
      </div>
    </section>
  );
}
