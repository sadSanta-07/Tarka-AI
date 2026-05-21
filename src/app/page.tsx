import AuditForm from "@/components/audit-form";
import { TrendingDown, Shield, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Spend Audit — Find out if you're overpaying for AI tools",
  description:
    "Free tool for startup founders and engineering managers. Input your AI subscriptions, get an instant audit with exact savings numbers. No signup required.",
  openGraph: {
    title: "AI Spend Audit — Find out if you're overpaying for AI tools",
    description:
      "Free audit for your AI tool stack. Most teams find $200–$800/mo in waste in under 60 seconds.",
    siteName: "Tarka AI AI Spend Audit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Spend Audit — Find out if you're overpaying for AI tools",
    description:
      "Free audit for your AI tool stack. Most teams find $200–$800/mo in waste in under 60 seconds.",
  },
};

const SOCIAL_PROOF = [
  { stat: "$340/mo", label: "avg savings found" },
  { stat: "60 sec", label: "to complete" },
  { stat: "100%", label: "free, no login" },
];

const WHY_ITEMS = [
  {
    icon: TrendingDown,
    title: "Exact numbers, not guesses",
    body: "Every recommendation traces back to current vendor pricing. A finance person would agree with the math.",
  },
  {
    icon: Shield,
    title: "Honest when you're already optimal",
    body: "If your stack is lean, we'll say so. We don't manufacture savings to manufacture leads.",
  },
  {
    icon: Zap,
    title: "Instant — no account needed",
    body: "Results in under 5 seconds. Email is optional and asked after you've seen the audit, never before.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-16 space-y-12">

        {/* ── Nav ── */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            Tarka AI <span className="text-emerald-400">audit</span>
          </span>
          <a
            href="https://Tarka AI.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            by Tarka AI →
          </a>
        </div>

        {/* ── Hero ── */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Free · No login required
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-zinc-100 sm:text-5xl">
            Are you overpaying
            <br />
            <span className="text-emerald-400">for AI tools?</span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
            Most startups pay full retail for Cursor, Claude, ChatGPT, and
            Copilot — and have no idea they&apos;re on the wrong plan. This
            audit tells you exactly where the waste is and what to do about it.
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-6">
            {SOCIAL_PROOF.map((s) => (
              <div key={s.stat} className="text-center">
                <p className="text-xl font-bold text-zinc-100">{s.stat}</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form ── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-100">
              Start your free audit
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Add the AI tools your team pays for. Takes about 60 seconds.
            </p>
          </div>
          <AuditForm />
        </div>

        {/* ── Why trust this ── */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Why this audit is different
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {WHY_ITEMS.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2"
              >
                <item.icon className="h-5 w-5 text-emerald-400" />
                <p className="text-sm font-semibold text-zinc-200">{item.title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-zinc-800 pt-6 flex items-center justify-between">
          <p className="text-xs text-zinc-600">
            Built by{" "}
            <a
              href="https://Tarka AI.rocks"
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Tarka AI
            </a>{" "}
            — discounted AI infrastructure credits
          </p>
          <p className="text-xs text-zinc-700">Pricing verified weekly</p>
        </div>

      </div>
    </main>
  );
}