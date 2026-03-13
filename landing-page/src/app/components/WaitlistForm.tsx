"use client";

import { useState, type FormEvent } from "react";

export default function WaitlistForm({ variant = "default" }: { variant?: "default" | "compact" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
      <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-2xl bg-mabel-surface px-6 py-4 shadow-sm">
        <span className="text-2xl" aria-hidden="true">&#10024;</span>
        <div>
          <p className="font-bold text-mabel-teal">You&apos;re on the list!</p>
          <p className="text-sm text-mabel-subtle">
            We&apos;ll let you know as soon as Mabel is ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div
        className={`flex gap-3 ${variant === "compact" ? "flex-col sm:flex-row" : "flex-col sm:flex-row"}`}
      >
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
          className={`flex-1 rounded-[14px] border-[3px] bg-mabel-surface px-4 py-3.5 text-mabel-text placeholder:text-mabel-subtle/60 transition-[border-color,box-shadow] duration-200 focus-visible:outline-none ${
            status === "error"
              ? "border-mabel-burgundy focus-visible:ring-2 focus-visible:ring-mabel-burgundy/40"
              : "border-mabel-teal/30 focus-visible:border-mabel-teal focus-visible:ring-2 focus-visible:ring-mabel-teal/30 focus-visible:shadow-[0_0_10px_rgba(31,122,111,0.3)]"
          }`}
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-full bg-mabel-teal px-8 py-3.5 font-bold text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-transform duration-200 hover:scale-[0.98] active:scale-[0.96] disabled:opacity-40 disabled:shadow-none cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-mabel-teal focus-visible:ring-offset-2 focus-visible:outline-none touch-action-manipulation"
        >
          {status === "submitting" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
              Joining\u2026
            </span>
          ) : (
            "Join the Waitlist"
          )}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" aria-live="polite" className="mt-2 text-sm text-mabel-burgundy">{errorMessage}</p>
      )}
    </form>
  );
}
