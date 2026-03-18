import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";

const comfortaa = Comfortaa({
  variable: "--font-comfortaa-google",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://trymabel.app"),
  title: "Mabel — Speak Your Memoir Into Existence",
  icons: {
    icon: "/images/mabel-app-icon.png",
    apple: "/apple-touch-icon.png",
  },
  description:
    "Your AI memoir companion. Just talk — Mabel writes. Record your life story by voice and let AI transform it into a beautifully written memoir. No writing required.",
  keywords: [
    "memoir",
    "life story",
    "voice recording",
    "AI writing",
    "family stories",
    "autobiography",
    "gift for grandparents",
  ],
  openGraph: {
    title: "Mabel — Speak Your Memoir Into Existence",
    description:
      "Your memoir companion. Just talk — Mabel writes. Everyone\u2019s stories deserve to be heard.",
    images: [{ url: "/images/mabel-mascot.png", width: 512, height: 512 }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mabel — Speak Your Memoir Into Existence",
    description:
      "Your memoir companion. Just talk — Mabel writes.",
    images: ["/images/mabel-mascot.png"],
  },
  other: {
    "theme-color": "#FFFFFF",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FFFFFF" />
      </head>
      <body className={`${comfortaa.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-mabel-primary focus:px-4 focus:py-2 focus:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mabel-primary focus-visible:ring-offset-2"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
