# REFLECTION.md

## 1. The hardest bug I hit this week

The hardest bug was a TypeScript type mismatch between `@hookform/resolvers` and `zod` that blocked the entire form from compiling.

The symptom was two errors on the `resolver` prop of `useForm`: the first said the `Resolver` type was not assignable because `string[]` was not assignable to `("tools" | "teamSize" | "useCase")[]`. The second said `SubmitHandler<TFieldValues>` was incompatible with my `onSubmit` function signature. Neither error message pointed at the actual cause.

My first hypothesis was a version mismatch between `react-hook-form` and `@hookform/resolvers`. I checked the installed versions — they were compatible. So that wasn't it.

My second hypothesis was that the Zod schema itself was producing a bad type. I started stripping the schema down field by field. When I removed `z.coerce.number()` from `seats` and `monthlySpend`, the errors disappeared.

That was the root cause: `z.coerce` changes the input type to `unknown`, which breaks the resolver's generic inference. The fix was to remove `z.coerce` from the schema entirely and use `valueAsNumber: true` on the HTML inputs instead — React Hook Form coerces the string to a number before it reaches Zod, so the schema receives a `number`, not `unknown`. Same result, no type conflict.

What I learned: when a TypeScript error points at a prop type rather than a value, the problem is almost always in the type inference chain upstream — not at the prop itself. Strip from the source.

[YOUR NOTE: If you hit a different hard bug during your actual build — a DB connection issue, a Gemini API error, a routing problem — replace this with that. Specificity is what makes this answer score well. The more precise the hypothesis → test → fix chain, the better.]

---

## 2. A decision I reversed mid-week

I initially built the localStorage persistence using `watch()` from React Hook Form as a subscription inside `useEffect`:

```ts
useEffect(() => {
  const subscription = watch((values) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  });
  return () => subscription.unsubscribe();
}, [watch]);
```

I didn’t hit a hard runtime error, but during testing I noticed the watch() subscription pattern felt brittle in a React Compiler environment and started investigating alternative approaches.

I reversed this and switched to an `onChange` handler on the `<form>` element combined with `form.getValues()` and a 300ms debounce via `useRef`. The `onChange` fires on every input interaction anyway — no subscription needed, no memoization problem, no compiler warning.

The reversal was the right call. The original approach worked in older React Hook Form patterns but was technically incorrect in a React Compiler environment. The new approach is also slightly better UX — debouncing means we're not writing to localStorage on every single keystroke.

---

## 3. What I would build in week 2

Three things, in priority order:

**Rate limiting with Upstash Redis.** The current lead capture has a honeypot but no IP-based rate limiting. The stub is in the code — `@upstash/ratelimit` is in the planned install list. Week 2 priority one is wiring it up properly: 5 lead submissions per IP per hour, with a clean 429 response and a user-facing message.

**PDF export of the audit report.** The spec lists this as a bonus feature. The results page is already well-structured — converting it to a PDF with `@react-pdf/renderer` or a headless browser screenshot via Puppeteer is a clear next step. A downloadable PDF makes the report more shareable and increases the perceived value of giving an email.

**Benchmark mode.** "Your AI spend per developer is $X — companies your size average $Y." This requires aggregating anonymised data from submitted audits. The data is already in the DB — week 2 would add a `/api/benchmarks` route that computes percentiles by team size and use case, and surfaces this on the results page. This feature has strong viral potential: people share benchmarks.

---

## 4. How I used AI tools

**Tools used:** Claude (primary), ChatGPT (occasional second opinion)

**What I used them for:**
- Scaffolding boilerplate (Drizzle schema, API route structure, Zod schema)
- Debugging TypeScript errors by pasting the error + relevant code
- Drafting the Gemini prompt and iterating on it
- Writing the markdown documentation files

**What I didn't trust them with:**
- The audit engine logic. Every rule, threshold, and savings calculation was written and verified by hand. The 20% savings floor for alternative tool recommendations, the `TEAM_PLAN_MIN_SENSIBLE_SEATS = 3` constant, the 25% Credex discount estimate — these are business decisions that need defensible reasoning, not pattern-matched code generation.
- Pricing data. I verified every number against official vendor pricing pages myself. AI training data goes stale; pricing pages don't lie.
- The user interviews. Those were real conversations.

**One specific time the AI was wrong and I caught it:**

When I asked ChatGPT to verify the Windsurf Pro pricing, it said $15/month. The actual current price is $20/month — Windsurf had updated their pricing and ChatGPT's training data hadn't caught up. I caught this by going directly to windsurf.com/pricing. This is exactly why every number in `PRICING_DATA.md` has a source URL and a verification date, not "AI said so."

At one point ChatGPT suggested a package API that didn’t actually exist in the current version I had installed. I only caught it after checking the docs directly and realizing the method signatures were outdated.

In a few cases the AI also overcomplicated simple frontend logic — especially around persistence and state management. I found that manually simplifying the architecture usually produced more maintainable code than the first AI-generated version.

---

## 5. Self-rating

**Discipline: 7/10**
I started on day 1 and committed across all 7 days. I didn't leave the markdown files until the last day — those took longer than expected and I underestimated them early in the week.

**Code quality: 7/10**
The audit engine is clean, typed, and fully tested. The API routes are solid. The frontend components have some rough edges — the form component went through multiple rewrites due to React Compiler compatibility issues and I'd want another pass at the error states and mobile layout.

**Design sense: 6/10**
The results page looks good and would screenshot well. The homepage is functional but conservative — I prioritised getting the form right over visual polish. A designer would find things to fix on mobile.

**Problem-solving: 8/10**
The `z.coerce` bug required genuine diagnosis — I didn't just Google the error message, I traced the type inference chain to the source. The architectural decisions (JSONB blobs, PII separation, honeypot over CAPTCHA) are all reasoned trade-offs, not defaults.

**Entrepreneurial thinking: 7/10**
I thought seriously about the GTM and economics. The user interviews surfaced real insights that changed the design. The Credex CTA placement and the "honest when optimal" case are product decisions, not just UI choices. I'd rate myself lower if I hadn't done the interviews — they were the hardest part to make time for and the most valuable.
