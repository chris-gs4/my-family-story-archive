"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow] duration-300 ${
        scrolled
          ? "bg-mabel-warm-bg/95 shadow-[0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Image
          src="/images/mabel-logo.png"
          alt="Mabel"
          width={160}
          height={40}
          className="h-8 w-auto sm:h-10"
          priority
        />
        <a
          href="#waitlist"
          className="rounded-full bg-mabel-teal px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-transform duration-200 hover:scale-[0.98] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-mabel-teal focus-visible:ring-offset-2 touch-action-manipulation"
        >
          Join Waitlist
        </a>
      </nav>
    </header>
  );
}
