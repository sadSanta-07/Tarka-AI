"use client";

import { useState } from "react";
import { Loader2, Mail, Bell } from "lucide-react";

type Props = {
  auditId: string;
  totalMonthlySavings: number;
  isHighValue: boolean;
  isAlreadyOptimal: boolean;
};

export function LeadCaptureForm({
  auditId,
  totalMonthlySavings,
  isHighValue,
  isAlreadyOptimal,
}: Props) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, email, company, role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(data.message ?? "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-center space-y-2">
        <Mail className="mx-auto h-8 w-8 text-emerald-400" />
        <p className="font-semibold text-zinc-100">Report sent to {email}</p>
        <p className="text-sm text-zinc-400">
          {isHighValue
            ? "A Tarka AI advisor will reach out about your savings opportunity."
            : "We'll notify you when new optimizations apply to your stack."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <Bell className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-zinc-100">
            {isAlreadyOptimal
              ? "Get notified when new savings apply"
              : "Get your full report by email"}
          </p>
          <p className="text-sm text-zinc-400 mt-0.5">
            {isAlreadyOptimal
              ? "AI pricing changes fast. We'll flag it when a better option appears for your stack."
              : `We'll send a PDF with your $${totalMonthlySavings}/mo savings breakdown and step-by-step switching guide.`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Honeypot*/}
        <input
          type="text"
          name="website"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          title="Leave this field blank"
        />

        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Company (optional)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
          <input
            type="text"
            placeholder="Role (optional)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </span>
          ) : isAlreadyOptimal ? (
            "Notify me of new savings"
          ) : (
            "Send my full report"
          )}
        </button>

        <p className="text-center text-xs text-zinc-600">
          No spam. Unsubscribe any time.
        </p>
      </form>
    </div>
  );
}