import Image from "next/image";

export default function ForGiftGivers() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[20px] bg-mabel-surface p-8 shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:p-12 lg:p-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-xl">
              <p className="mb-2 text-sm font-bold tracking-widest text-mabel-copper uppercase">
                For Gift Givers
              </p>
              <h2 className="mb-6 text-2xl font-bold text-balance sm:text-3xl">
                The Gift of a Lifetime
              </h2>

              <p className="mb-4 text-lg leading-relaxed text-mabel-subtle">
                Think about your grandparents.
              </p>

              <p className="mb-4 leading-relaxed text-mabel-subtle">
                The stories they carry that you&apos;ve never heard. The childhood
                memories, the love stories, the lessons learned through decades of
                living. The ones that will disappear when they do.
              </p>

              <p className="mb-6 font-medium leading-relaxed">
                Mabel makes it almost effortless to capture them.
              </p>

              <p className="mb-8 leading-relaxed text-mabel-subtle">
                Gift Mabel to your parents, grandparents, or anyone whose stories
                deserve to be preserved. No writing required \u2014 talking is the UX,
                so anyone can use it. Even your grandparents.
              </p>

              <a
                href="#waitlist"
                className="inline-block rounded-full bg-mabel-teal px-8 py-3.5 font-bold text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-transform duration-200 hover:scale-[0.98] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-mabel-teal focus-visible:ring-offset-2 focus-visible:outline-none touch-action-manipulation"
              >
                Join the Waitlist to Gift Mabel
              </a>
            </div>

            {/* Decorative mascot */}
            <div className="hidden lg:block" aria-hidden="true">
              <div className="relative">
                <div className="absolute inset-0 -m-8 rounded-full bg-mabel-gold/10 blur-2xl" />
                <Image
                  src="/images/mabel-mascot.png"
                  alt=""
                  width={200}
                  height={200}
                  className="relative h-40 w-40 opacity-90"
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-mabel-gold/10 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-mabel-teal/5 blur-2xl" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
