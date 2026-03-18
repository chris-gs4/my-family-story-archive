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
      <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-[rgba(0,0,0,0.08)] bg-mabel-bg-alt px-6 py-4">
        <span className="text-2xl" aria-hidden="true">&#10024;</span>
        <div>
          <p className="font-bold text-mabel-primary">You&apos;re on the list!</p>
          <p className="text-sm">
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
          className={`min-w-0 flex-1 rounded-full bg-white text-[#2d2c2b] placeholder:text-mabel-text/40 transition-[border-color,box-shadow] duration-200 focus-visible:outline-none ${
            status === "error"
              ? "focus-visible:shadow-[0_0_0_3px_rgba(251,44,54,0.15)]"
              : "focus-visible:shadow-[0_0_0_3px_rgba(46,125,107,0.15)]"
          }`}
          style={{
            border: status === "error" ? "2px solid #fb2c36" : "2px solid #2E7D6B",
            padding: "14px 24px",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-full bg-mabel-primary px-8 py-3.5 font-semibold text-white shadow-[0_2px_8px_rgba(46,125,107,0.25)] transition-[background-color,transform,box-shadow,opacity] duration-200 hover:bg-mabel-primary-dark hover:scale-[0.98] active:scale-[0.96] disabled:opacity-40 disabled:shadow-none cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-mabel-primary focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {status === "submitting" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
              Joining&hellip;
            </span>
          ) : (
            "Join the Waitlist"
          )}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" aria-live="polite" className="mt-2 text-sm text-red-600">{errorMessage}</p>
      )}
    </form>
  );
}
