"use client";

import dynamic from "next/dynamic";

const AuditForm = dynamic(
  () => import("@/components/audit-form"),
  {
    ssr: false,
    loading: () => <div>Loading form...</div>,
  }
);
import {
  Shield,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: TrendingDown,
    title: "Exact pricing analysis",
    body: "Every recommendation maps to real vendor pricing and realistic team usage.",
  },
  {
    icon: Shield,
    title: "Honest optimization",
    body: "If your stack is already efficient, we’ll tell you directly.",
  },
  {
    icon: Zap,
    title: "Instant results",
    body: "No signup wall. No sales calls. Just actionable recommendations.",
  },
];

export default function HomePage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-black text-white"
      aria-label="Tarka AI homepage"
    >
      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-120px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-xl" />

        <div className="absolute bottom-[-100px] left-[-100px] h-[320px] w-[320px] rounded-full bg-emerald-500/5 blur-xl" />

        <div className="absolute right-[-80px] top-1/3 h-[260px] w-[260px] rounded-full bg-white/[0.03] blur-xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl"
              aria-hidden="true"
            >
              <Sparkles
                className="h-4 w-4 text-emerald-400"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-tight text-white">
                Tarka AI
              </p>

              <p className="text-xs text-zinc-300">
                AI Spend Audit
              </p>
            </div>
          </div>

          <a
            href="#audit"
            className="hidden min-h-[44px] rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm text-zinc-100 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:flex items-center"
          >
            Run audit
          </a>
        </header>

        {/* Hero Section */}
        <section
          aria-labelledby="hero-heading"
          className="grid flex-1 items-center gap-16 py-14 lg:grid-cols-[1.05fr_0.95fr]"
        >
          {/* Left Side */}
          <div className="space-y-8 fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 backdrop-blur-xl">
              Free audit · No login required
            </div>

            <div className="space-y-6">
              <h1
                id="hero-heading"
                className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-[72px]"
              >
                Stop wasting
                <br />
                money on AI tools.
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
                Most startups overpay for Cursor, Claude,
                ChatGPT, Copilot, and internal AI tooling
                without realizing it. Tarka analyzes your
                stack and shows exactly where the waste is.
              </p>
            </div>

            {/* Stats */}
            <section
              aria-label="Audit statistics"
              className="flex flex-wrap items-center gap-5 pt-2 text-sm text-zinc-300"
            >
              <div>
                <span className="font-semibold text-white">
                  $340/mo
                </span>{" "}
                average savings
              </div>

              <div
                className="h-1 w-1 rounded-full bg-zinc-600"
                aria-hidden="true"
              />

              <div>
                <span className="font-semibold text-white">
                  60 sec
                </span>{" "}
                to complete
              </div>

              <div
                className="h-1 w-1 rounded-full bg-zinc-600"
                aria-hidden="true"
              />

              <div>
                <span className="font-semibold text-white">
                  100%
                </span>{" "}
                free
              </div>
            </section>

            {/* Features */}
            <section
              aria-labelledby="features-heading"
              className="pt-6"
            >
              <h2
                id="features-heading"
                className="sr-only"
              >
                Product features
              </h2>

              <div className="grid gap-4 md:grid-cols-3">
                {FEATURES.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-3xl bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:bg-white/[0.05]"
                  >
                    <div
                      className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10"
                      aria-hidden="true"
                    >
                      <item.icon
                        className="h-5 w-5 text-emerald-400"
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="text-sm font-semibold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                      {item.body}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Audit Card */}
          <section
            id="audit"
            aria-labelledby="audit-heading"
            className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.04] p-7 shadow-[0_0_80px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-1 fade-up"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent"
            />

            <div className="relative">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <h2
                    id="audit-heading"
                    className="text-2xl font-semibold text-white"
                  >
                    Start your audit
                  </h2>

                  <p className="mt-1 text-sm text-zinc-300">
                    Takes less than a minute.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                    aria-hidden="true"
                  />

                  Live
                </div>
              </div>

              <AuditForm />

              <div className="mt-6 flex items-center gap-2 text-xs text-zinc-300">
                <Shield
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />

                <span>
                  No spam. No sales calls. Email optional.
                </span>
              </div>
            </div>
          </section>
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] py-8 text-sm text-zinc-400 sm:flex-row">
          <p>
            Built by{" "}
            <span className="text-zinc-200">
              Tarka AI
            </span>
          </p>

          <nav
            aria-label="Footer information"
            className="flex items-center gap-3 text-xs text-zinc-400"
          >
            <span>AI spend optimization</span>

            <span aria-hidden="true">•</span>

            <span>Pricing updated weekly</span>

            <span aria-hidden="true">•</span>

            <span>Infrastructure savings</span>
          </nav>
        </footer>
      </div>
    </main>
  );
}