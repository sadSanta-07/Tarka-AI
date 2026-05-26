# DEVLOG.md

## Day 1 — 2026-05-20

**Hours worked:** 4

**What I did:**
Read the full assignment brief twice before touching any code. Mapped out the full build order — schema first, then pricing data, then audit engine, then UI, then docs. Set up the Next.js project, installed all core dependencies (drizzle-orm, react-hook-form, zod, resend, nanoid, lucide-react), configured drizzle.config.ts, and connected to Neon Postgres. Designed and pushed the initial DB schema — two tables: `audits` (JSONB blobs for input + result, nanoid slug as PK) and `leads` (PII separated from audit data by design). Sketched the initial pricing data structure and source mapping strategy for supported tools.

**What I learned:**
Drizzle's `.$type<>()` generic on JSONB columns gives full TypeScript inference at query time — no casting needed later. Worth the upfront type work. Also confirmed that `z.coerce` and `@hookform/resolvers` don't play well together — caught this early before it could block the form build.

**Blockers / what I'm stuck on:**
Had to decide between JSONB blobs vs normalized columns for audit data. Went with JSONB — the audit shape is too variable and will evolve as pricing changes. Documented this decision.

**Plan for tomorrow:**
Build the audit engine with all four rules, write tests immediately after, then start the spend input form.

---

## Day 2 — 2026-05-21

**Hours worked:** 5

**What I did:**
Built the core audit engine (`src/lib/audit-engine.ts`) — four deterministic rules in priority order: team plan overkill, cheaper same-vendor plan, cheaper alternative tool (20% savings floor), Credex credits for API spend. Wrote Vitest tests covering all rules, edge cases, and the total savings aggregation. Initial Vitest coverage passed locally before expanding edge-case scenarios later. Started the spend input form — React Hook Form + Zod, dynamic field array for adding/removing tools, cascading tool→plan dropdowns.

**What I learned:**
The 20% savings floor on Rule 3 is important — without it, the engine flags $2 savings opportunities that aren't worth the migration friction. Also learned that `valueAsNumber: true` on HTML inputs is the right way to handle number coercion with RHF + Zod — keeps the schema types clean without `z.coerce`.

**Blockers / what I'm stuck on:**
React Compiler (enabled by default in Next.js 15) flagged the `watch()` subscription pattern from React Hook Form inside a `useEffect`. Spent time debugging the warning — fixed by replacing the subscription with an `onChange` handler on the form element combined with `form.getValues()` and a debounce ref.

**Plan for tomorrow:**
Finish the form (localStorage persistence, validation errors, submit flow), build the API route, and wire up Gemini.

---

## Day 3 — 2026-05-22

**Hours worked:** 6

**What I did:**
Completed the spend input form with localStorage persistence across reloads. Built `POST /api/audit` — validates input with Zod server-side, runs the audit engine, calls Gemini for the summary paragraph, saves to Neon, returns auditId. Built the Gemini helper with graceful fallback — if the API call fails or returns < 50 characters, a data-driven fallback template is used. The audit is never blocked on AI availability. Started the results page — Started the results page — server component fetches audit by ID, while the client component handles the audit breakdown rendering flow.

**What I learned:**
Gemini's default response length without a word count constraint in the prompt is 180–220 words — too long for the results page. Adding "exactly 80–120 words" tightened responses immediately. Also: passing audit data as a structured list in the prompt reduces hallucination compared to passing it as prose.

**Blockers / what I'm stuck on:**
First version of the Gemini prompt produced generic marketing language ("leverage your AI investments", "unlock savings"). Added explicit word bans to the prompt — "do not use leverage, unlock, or supercharge." Fixed the tone immediately.

**Plan for tomorrow:**
Finish results page UI, build lead capture form + `/api/leads` route, wire up Resend email.

---

## Day 4 — 2026-05-23

**Hours worked:** 5

**What I did:**
Completed the results page — savings hero, per-tool breakdown with action badges, AI summary block, Credex CTA for high-savings audits (>$500/mo), honest "you're spending well" state for already-optimal stacks. Built the lead capture form and `POST /api/leads` route — email gate with optional company/role fields, honeypot abuse protection, Resend transactional email, duplicate submission guard. Ran first full end-to-end test: submitted a real audit (Cursor Business 2 seats + Claude Team 2 seats + ChatGPT Plus + Anthropic API $300/mo), got $135/mo savings, results page rendered correctly, email arrived in inbox.

**What I learned:**
Resend's free tier only sends to verified email addresses until a sending domain is verified. Documented this limitation in ARCHITECTURE.md — the lead capture and email logic are fully implemented, it's purely an infrastructure constraint on the free tier.

**Blockers / what I'm stuck on:**
Did a find-and-replace to rename "Credex" → "Tarka AI" across the codebase and accidentally changed reasoning strings inside the audit engine that should always reference Credex as the credit provider. Fixed with a targeted grep and manual correction. Added a note to keep tool/brand name and credit provider name separate in future find-replaces.

**Plan for tomorrow:**
Build homepage, add OG tags for shareable URLs, deploy to Vercel, run Lighthouse audit.

---

## Day 5 — 2026-05-24

**Hours worked:** 5

**What I did:**
Built the homepage with landing copy, social proof stats, and the embedded audit form. Added OG metadata to both the homepage and the dynamic audit result pages — `title`, `description`, `openGraph`, and `twitter` card tags. Deployed to Vercel. Confirmed all three environment variables (DATABASE_URL, GEMINI_API_KEY, RESEND_API_KEY) are set in Vercel project settings. Ran full end-to-end test on the live URL — audit submission, results page, Ran full end-to-end test on the live URL — core audit submission, results rendering, lead capture, and email delivery all working in the production deployment.

**What I learned:**
Next.js server components generate OG metadata at request time, which means the audit result page gets the correct dynamic title ("Save $135/mo on AI tools") rather than a generic fallback. This is important for the shareable URL mechanic — the link preview shows the actual savings number.

**Blockers / what I'm stuck on:**
Lighthouse accessibility score was initially below 90 due to missing label associations on the form inputs and low contrast on some zinc-500 text. Fixed by adding explicit `htmlFor`/`id` pairs to all inputs and bumping text colors to zinc-400 minimum.

**Plan for tomorrow:**
Write CI workflow, verify tests pass in GitHub Actions, start markdown documentation files.

---

## Day 6 — 2026-05-25

**Hours worked:** 6

**What I did:**
Set up GitHub Actions CI workflow — runs `tsc --noEmit` and `vitest run` on every push to main. All 15 tests green in CI. Wrote PRICING_DATA.md (every number sourced to official vendor URL), PROMPTS.md (full prompt, iteration history, fallback documentation), README.md (decisions section, quick start, stack), ARCHITECTURE.md (Mermaid system diagram, data flow, scaling analysis), REFLECTION.md. Verified Windsurf Pro pricing against live pricing page — had changed from $15/mo to $20/mo since initial build, updated pricing-data.ts and PRICING_DATA.md.

**What I learned:**
AI tool pricing changes faster than expected. Windsurf updated their pricing between when I initially wrote the pricing data and submission week. This reinforces why every number in PRICING_DATA.md has a verification date — it's not bureaucracy, it's the only way to know if the data is stale.

**Blockers / what I'm stuck on:**
The `tsc --noEmit` step in CI initially failed because of a type error in the leads API route — `res.json()` returns `unknown` and I was accessing `.message` directly without a type assertion. Fixed with a cast: `await res.json().catch(() => ({})) as { message?: string }`.

**Plan for tomorrow:**
Write GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md, DEVLOG.md. Conduct user interviews. Final review and submit.

---

## Day 7 — 2026-05-26

**Hours worked:** 5

**What I did:**
Completed all remaining documentation: GTM.md (specific channels, first-100-users plan, unfair distribution channel), ECONOMICS.md (full unit economics with funnel math and $1M ARR path), LANDING_COPY.md (hero, subheadline, social proof, FAQ), METRICS.md (North Star metric, input metrics, pivot triggers). Conducted three user interviews with founders and engineering managers from my network — documented in USER_INTERVIEWS.md. Final review of all six MVP features against the spec checklist. Final pass included fixing GitHub Actions workflow triggers, resolving remaining ESLint warnings in test files, and re-running the full CI pipeline before submission.

**What I learned:**
The user interviews were the hardest part of the week to make time for and the most valuable. All three people I talked to confirmed the core problem is real — they're all vaguely aware they're probably overspending on AI tools but haven't sat down to audit it. One interview changed the homepage copy — I originally led with "find waste in your AI spend" but one interviewee said the word "waste" felt accusatory. Switched to "are you overpaying" which frames it as a question rather than a judgment.

**Blockers / what I'm stuck on:**
None at submission. The Resend sending domain limitation is documented and understood — not a blocker, just a free-tier constraint.