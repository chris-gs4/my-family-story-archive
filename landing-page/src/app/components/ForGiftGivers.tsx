import WaitlistForm from "./WaitlistForm";

export default function ForGiftGivers() {
  return (
    <section className="px-6 py-12 sm:py-20" style={{ backgroundColor: "#2E7D6B" }}>
      <div className="mx-auto max-w-[800px] text-center text-white">
        <p className="mb-2 text-sm font-semibold tracking-[0.08em] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>
          For Gift Givers
        </p>
        <h2 className="mb-6 text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
          The Gift of a Lifetime
        </h2>

        <p className="mb-4 text-lg leading-relaxed">
          Think about your grandparents.
        </p>

        <p className="mb-4 leading-relaxed text-base sm:text-lg" style={{ color: "rgba(255,255,255,0.85)" }}>
          The stories they carry that you&apos;ve never heard. The childhood
          memories, the love stories, the lessons learned through decades of
          living. The ones that will disappear when they do.
        </p>

        <p className="mb-6 text-base font-bold leading-relaxed sm:text-lg">
          Mabel makes it almost effortless to capture them.
        </p>

        <p className="mb-8 leading-relaxed text-base sm:text-lg" style={{ color: "rgba(255,255,255,0.85)" }}>
          Gift Mabel to your parents, grandparents, or anyone whose stories
          deserve to be preserved. No writing required &mdash; talking is the UX,
          so anyone can use it. Even your grandparents.
        </p>

        <div className="mx-auto flex justify-center">
          <WaitlistForm variant="dark" />
        </div>
      </div>
    </section>
  );
}
