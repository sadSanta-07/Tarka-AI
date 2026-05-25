# PROMPTS.md

## Overview

The audit engine uses **no AI** for its core calculations — savings numbers, plan recommendations, and reasoning strings are all deterministic hardcoded logic. This is intentional. A finance person should be able to verify every number without trusting a language model.

AI is used exactly once: to generate a ~100-word personalized summary paragraph after the audit is computed. The summary synthesizes the audit findings into plain prose. If the API call fails, a templated fallback is used — the audit result is never blocked on AI availability.

---

## Prompt 1 — Audit summary generation

**File:** `src/lib/gemini.ts` — `buildPrompt()`
**Model:** `gemini-1.5-flash`
**Trigger:** Called once per audit submission, after `runAudit()` completes

### Full prompt

```
You are a blunt, numbers-first AI spending advisor writing for a startup founder or engineering manager.

Context:
- Team size: {teamSize}
- Primary use case: {useCase}
- Total current AI spend: ${totalCurrentSpend}/mo
- Total potential savings: ${totalMonthlySavings}/mo (${totalAnnualSavings}/yr)
- Optimization score: {optimizationScore}/100

Per-tool findings:
{toolLines}

Write a single paragraph of exactly 80–120 words. Rules:
1. Open with the biggest single saving opportunity by dollar amount.
2. Mention the optimization score and what it means for this team.
3. If total savings > $500/mo, mention that discounted AI credits could compound these savings further.
4. If total savings < $100/mo, be honest — tell them they're already running lean.
5. No bullet points. No headers. No markdown. Plain prose only.
6. Do not use the word "leverage". Do not use "unlock". Do not use "supercharge".
7. Sound like a CFO giving a peer a straight answer, not a SaaS marketing page.
```

### Why I wrote it this way

**Persona definition first.** "Blunt, numbers-first CFO" is more constraining than "helpful assistant." Generic personas produce generic prose. A CFO voice produces sentences like "these corrections stop $135 a month in waste" rather than "you could potentially save up to $135."

**Explicit word bans.** "Leverage", "unlock", "supercharge" are the three most common AI-generated marketing words. Banning them forces the model toward plain language. This is the single most effective prompt technique I found for making AI-generated text sound human.

**Hard word count range.** 80–120 words. Without this, Gemini defaults to ~200 words. The summary is shown on the results page alongside a full tool breakdown — it should be a paragraph, not an essay.

**Structured context block.** Passing the actual numbers as a structured block (not prose) reduces hallucination. The model can't invent a savings figure if it's been given `totalMonthlySavings: 135` explicitly.

**Conditional rules 3 and 4.** The prompt handles both the high-savings and already-optimal cases with explicit instructions. Without these, the model would either manufacture urgency for lean stacks or undersell genuine savings opportunities.

---

### What I tried that didn't work

**Version 1 — no persona, just "summarize this audit"**

Result: Generic bullet-point list disguised as a paragraph. Started with "Based on your audit results..." every single time. Felt like a chatbot, not an advisor.

**Version 2 — asked for "conversational" tone**

Result: Too casual. "Hey, looks like you're spending a bit more than you need to!" is not what an engineering manager wants to read.

**Version 3 — no word count constraint**

Result: 180–220 word responses consistently. Too long for the results page layout. Added the 80–120 word rule and responses tightened immediately.

**Version 4 — passing tool data as prose instead of structured list**

Result: Model occasionally hallucinated tool names or mixed up savings figures. Switching to a structured `{toolLines}` format where each line is `- ToolName: action → save $X/mo. Reason` eliminated this.

---

## Fallback template

**File:** `src/lib/gemini.ts` — `buildFallbackSummary()`
**Trigger:** Used when Gemini API call throws or returns < 50 characters

The fallback is data-driven — it uses the actual `resultData` numbers, not generic placeholder text. A user who gets the fallback sees a real summary with their real numbers, not an error state.

Two variants:
- **Lean stack** (savings < $100/mo): acknowledges the optimization score and confirms the stack is well-matched
- **Savings found** (savings ≥ $100/mo): leads with the top saving opportunity by dollar amount, same structure as the AI version

The fallback was tested by temporarily unsetting `GEMINI_API_KEY` and running several audits. All fallback summaries read naturally alongside the tool breakdown.-