# METRICS.md

## North Star metric

**Audits completed per week**

Not visitors. Not signups. Audits completed.

An audit completed means a user filled in their actual tool stack and saw their results. That's the moment of value delivery — everything else (email capture, consult booking, credit purchase) flows from it. A user who lands and bounces created no value. A user who completes an audit has received something genuinely useful and is now a potential lead, sharer, and repeat user.

"Audits completed" also captures product quality in a way that visitors don't. If the form is too long, confusing, or untrustworthy, completion rate drops. The North Star rewards us for making the core experience better, not just for driving more traffic.

---

## 3 input metrics that drive the North Star

**1. Visitor → audit start rate**
The percentage of homepage visitors who interact with the form at all (select at least one tool). Measures whether the hero copy and page design create enough trust and clarity to get someone to engage. Target: >40%. If below 30%, the above-the-fold copy isn't working.

**2. Audit start → audit completion rate**
The percentage of users who start filling the form and actually submit it. Measures form UX — is it too long, too confusing, do people drop off at a specific field? Target: >60%. Drop-off on the monthly spend field specifically would indicate price anchoring anxiety (people uncomfortable entering real numbers).

**3. Audit completion → email capture rate**
The percentage of completed audits that result in an email submission. Measures whether the results page delivers enough perceived value to earn contact information. Target: >20% overall, >50% for high-savings audits (>$500/mo). If high-savings users aren't converting to email, the results page design or the lead capture copy is weak.

---

## What I'd instrument first

In priority order:

1. **Audit completion event** — fire on successful POST /api/audit response. This is the North Star — instrument it first.
2. **Form abandonment by field** — which field do users drop off on? Track `focus` events on each field. If people open the monthly spend field and then leave, that's a specific UX problem.
3. **Results page time-on-page** — are users actually reading the breakdown or bouncing immediately? Low time-on-page with low email capture = results aren't credible.
4. **Shareable URL clicks** — how many people copy the link? How many unique visitors come from shared links? This tells you if the viral loop is actually working.
5. **Credex CTA click rate on high-savings audits** — of audits showing >$500/mo savings, what % click the Credex consultation link? This is the direct revenue signal.

Implementation: Posthog (open source, free tier, self-hostable) over Google Analytics. Posthog gives event-level data and session recordings without the GDPR complexity of GA4. Already in the planned install list.

---

## What number triggers a pivot decision

**If audit completion rate drops below 20% for 2 consecutive weeks**, the form is broken — either too long, too confusing, or the value proposition above the fold isn't converting. Pivot decision: cut the form to the minimum (just tool + plan + monthly spend, drop seats and use case), ship it, measure again. Simplicity beats completeness if completion rate collapses.

**If email capture rate on high-savings audits stays below 25% after 500 completed audits**, the results page isn't credible enough for users to give their email even when they're shown real savings. Pivot decision: add social proof (real user testimonials, total savings found across all audits), make the results page more visually shareable, and A/B test the email gate copy.

**If zero Credex consult bookings after 1,000 completed audits**, the tool is generating value for users but not for Credex. Pivot decision: make the Credex CTA more prominent, or reconsider whether the audit tool is the right lead-gen asset at all — maybe a different format (calculator, benchmark report) converts better to consultations.