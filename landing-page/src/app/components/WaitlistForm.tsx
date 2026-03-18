"use client";

import { useState, type FormEvent } from "react";

export default function WaitlistForm({ variant = "default" }: { variant?: "default" | "compact" | "dark" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const isDark = variant === "dark";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("submitting");
    setErrorMessage("");

    const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
    if (!formId) {
      // Fallback: show success even without Formspree configured (for development)
      await new Promise((r) => setTimeout(r, 800));
      setStatus("success");
      return;
    }

    try {
      const res = await fetch(`https://formspree.io/f/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Could not connect. Please check your connection and try again.");
    }
  };

  if (status === "success") {
    return (
      <div role="status" aria-live="polite" className={`flex items-center gap-3 rounded-xl px-6 py-4 ${isDark ? "border border-white/20 bg-white/10" : "border border-[rgba(0,0,0,0.08)] bg-mabel-bg-alt"}`}>
        <span className="text-2xl" aria-hidden="true">&#10024;</span>
        <div>
          <p className={`font-bold ${isDark ? "text-white" : "text-mabel-primary"}`}>You&apos;re on the list!</p>
          <p className={`text-sm ${isDark ? "text-white/80" : ""}`}>
            We&apos;ll let you know as soon as Mabel is ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex gap-3 flex-col sm:flex-row">
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          className={`min-w-0 flex-1 rounded-full bg-white text-[#2d2c2b] placeholder:text-[#2d2c2b]/40 transition-[border-color,box-shadow] duration-200 focus-visible:outline-none ${
            status === "error"
              ? "focus-visible:shadow-[0_0_0_3px_rgba(251,44,54,0.15)]"
              : isDark
                ? "focus-visible:shadow-[0_0_0_3px_rgba(255,255,255,0.2)]"
                : "focus-visible:shadow-[0_0_0_3px_rgba(46,125,107,0.15)]"
          }`}
          style={{
            border: status === "error" ? "2px solid #fb2c36" : isDark ? "2px solid white" : "2px solid #2E7D6B",
            padding: "14px 24px",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className={`rounded-full px-8 py-3.5 font-semibold transition-[background-color,transform,box-shadow,opacity] duration-200 hover:scale-[0.98] active:scale-[0.96] disabled:opacity-40 disabled:shadow-none cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
            isDark
              ? "bg-white text-[#2E7D6B] shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:bg-[#f0faf7] focus-visible:ring-white"
              : "bg-mabel-primary text-white shadow-[0_2px_8px_rgba(46,125,107,0.25)] hover:bg-mabel-primary-dark focus-visible:ring-mabel-primary"
          }`}
        >
          {status === "submitting" ? (
            <span className="flex items-center justify-center gap-2">
              <span className={`h-4 w-4 animate-spin rounded-full border-2 ${isDark ? "border-[#2E7D6B]/30 border-t-[#2E7D6B]" : "border-white/30 border-t-white"}`} aria-hidden="true" />
              Joining&hellip;
            </span>
          ) : (
            isDark ? "Gift Mabel 🎁" : "Join the Waitlist"
          )}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" aria-live="polite" className={`mt-2 text-sm ${isDark ? "text-red-300" : "text-red-600"}`}>{errorMessage}</p>
      )}
    </form>
  );
}
