"use client";

import { useState } from "react";
import {
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  Share2,
  Copy,
  Check,
} from "lucide-react";

import { HIGH_VALUE_SAVINGS_THRESHOLD } from "@/lib/pricing-data";
import type { audits } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { LeadCaptureForm } from "@/components/lead-capture-form";
type Audit = InferSelectModel<typeof audits>;

const ACTION_LABELS = {
  downgrade: { label: "Downgrade plan", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  switch: { label: "Switch tool", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  credits: { label: "Buy via Tarka AI", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  keep: { label: "Already optimal", color: "text-zinc-400", bg: "bg-zinc-800/60 border-zinc-700" },
} as const;

export function AuditResults({ audit }: { audit: Audit }) {
  const [copied, setCopied] = useState(false);
  const { resultData, inputData } = audit;
  const isHighValue = resultData.totalMonthlySavings >= HIGH_VALUE_SAVINGS_THRESHOLD;
  const isAlreadyOptimal =
    resultData.optimizationScore >= 80;

  const scoreLabel =
    resultData.optimizationScore >= 80
      ? "your stack is lean"
      : resultData.optimizationScore >= 50
        ? "some optimization opportunities exist"
        : "significant savings opportunities found";

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-widest mb-1">AI Spend Audit</p>
            <h1 className="text-2xl font-bold text-zinc-100">Your results</h1>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Share"}
          </button>
        </div>

        {/* ── Savings Hero ── */}
        <div className={`rounded-2xl border p-8 text-center ${isAlreadyOptimal
          ? "border-zinc-700 bg-zinc-900"
          : "border-emerald-500/30 bg-emerald-500/5"
          }`}>
          {isAlreadyOptimal ? (
            <>
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
              <p className="text-4xl font-bold text-zinc-100">You&apos;re spending well</p>
              <p className="mt-2 text-zinc-400">
                Optimization score: {resultData.optimizationScore}/100 — {scoreLabel}.
              </p>
            </>
          ) : (
            <>
              <TrendingDown className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
              <p className="text-zinc-400 text-sm mb-1">Potential monthly savings</p>
              <p className="text-6xl font-bold text-emerald-400">
                ${resultData.totalMonthlySavings.toLocaleString()}
              </p>
              <p className="mt-2 text-zinc-400">
                ${resultData.totalAnnualSavings.toLocaleString()}/yr · Optimization score:{" "}
                {resultData.optimizationScore}/100 — {scoreLabel}
              </p>
            </>
          )}
        </div>

        {/* AI Summary  */}
        {resultData.aiSummary && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                AI Analysis
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed text-sm">{resultData.aiSummary}</p>
          </div>
        )}

        {/* Per-tool breakdown */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Tool breakdown
          </h2>

          {resultData.recommendations.map((rec) => {
            const style = ACTION_LABELS[rec.recommendedAction];
            return (
              <div
                key={rec.toolId}
                className={`rounded-xl border p-4 ${style.bg}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-zinc-100">{rec.toolName}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${style.bg} ${style.color}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
                      {rec.reasoning}
                    </p>
                  </div>

                  {rec.recommendedAction !== "keep" && (
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                        <span className="line-through">${rec.currentMonthlySpend}/mo</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="text-zinc-200">${rec.projectedMonthlySpend}/mo</span>
                      </div>
                      <p className="text-emerald-400 font-semibold text-sm mt-0.5">
                        Save ${rec.monthlySavings}/mo
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isHighValue && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-100">
                  You qualify for Tarka AI credits
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  With ${resultData.totalMonthlySavings}/mo in identified savings, discounted AI
                  infrastructure credits from Tarka AI could reduce your bill further — without
                  changing your workflow. We source overforecast credits from companies that
                  pivoted.
                </p>
                <a
                  href="https://Tarka AI.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
                >
                  Book a Tarka AI consultation <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        <LeadCaptureForm
          auditId={audit.id}
          totalMonthlySavings={resultData.totalMonthlySavings}
          isHighValue={isHighValue}
          isAlreadyOptimal={isAlreadyOptimal}
        />

        {/* ── Share ── */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share this audit
          </button>
        </div>

      </div>
    </div>
  );
}