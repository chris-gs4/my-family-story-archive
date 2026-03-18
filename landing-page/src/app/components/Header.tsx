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
      className={`fixed top-0 left-0 right-0 z-50 bg-mabel-bg transition-shadow duration-300 border-b border-[rgba(0,0,0,0.08)] ${
        scrolled ? "shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : ""
      }`}
    >
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Image
          src="/images/mabel-logo.png"
          alt="Mabel"
          width={200}
          height={50}
          className="h-12 w-auto sm:h-14"
          priority
        />
        <a
          href="#waitlist"
          className="rounded-full bg-mabel-primary px-6 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(46,125,107,0.25)] transition-[background-color,transform,box-shadow] duration-200 hover:bg-mabel-primary-dark hover:scale-[0.98] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-mabel-primary focus-visible:ring-offset-2"
        >
          Join Waitlist
        </a>
      </nav>
    </header>
  );
}
