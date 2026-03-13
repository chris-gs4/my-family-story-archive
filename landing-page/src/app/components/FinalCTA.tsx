import WaitlistForm from "./WaitlistForm";

export default function FinalCTA() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <h2 className="mb-4 text-2xl font-bold text-balance sm:text-3xl">
          Everyone&apos;s Stories Deserve to Be Heard.
        </h2>

        <p className="mb-8 text-mabel-subtle">
          Join the waitlist and be the first to speak your memoir into existence.
        </p>

        <WaitlistForm variant="compact" />

        <p className="mt-6 text-xs text-mabel-subtle/70">
          No spam. Just the story of a lifetime.
        </p>
      </div>
    </section>
  );
}
