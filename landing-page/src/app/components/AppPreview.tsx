import Image from "next/image";

const screens = [
  {
    src: "/images/app-screens/screen1-welcome.png",
    alt: "Mabel welcome screen with warm onboarding",
    label: "Welcome",
  },
  {
    src: "/images/app-screens/screen3-recording.png",
    alt: "Mabel recording screen with guided voice interview",
    label: "Record",
  },
  {
    src: "/images/app-screens/screen5-saved-stories.png",
    alt: "Mabel saved stories screen showing generated narratives",
    label: "Your Stories",
  },
];

export default function AppPreview() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center text-2xl font-bold text-balance sm:text-3xl">
          See Mabel in Action
        </h2>
        <p className="mb-12 text-center text-mabel-subtle">
          A guided memoir experience, right in your pocket.
        </p>

        <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8 lg:gap-12">
          {screens.map((screen, i) => (
            <div key={i} className="flex flex-col items-center">
              {/* Phone frame */}
              <div className="overflow-hidden rounded-[28px] border-[6px] border-mabel-text/10 bg-mabel-text/5 shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
                <Image
                  src={screen.src}
                  alt={screen.alt}
                  width={220}
                  height={440}
                  className="h-auto w-40 sm:w-48"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <p className="mt-3 text-sm font-medium text-mabel-subtle">
                {screen.label}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm font-medium text-mabel-greeting">
          Coming soon to the App Store.
        </p>
      </div>
    </section>
  );
}
