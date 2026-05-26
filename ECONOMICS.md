# ECONOMICS.md

## What a converted lead is worth to Credex

Credex sells discounted AI infrastructure credits. The discount is real — sourced from companies that overforecast or pivoted. Credex's margin is the spread between what they acquire credits for and what they sell them at.

**Assumptions (conservative):**
- Average credit purchase: $2,000 (a 10-person startup buying 6 months of Cursor + Claude credits upfront at a discount)
- Credex gross margin on credits: ~30% (sourced at 40% off retail, sold at 10% off retail — Credex keeps the spread)
- Gross profit per transaction: $600
- Average customer buys credits 2x per year (semi-annual repurchase as credits are consumed)
- Annual gross profit per customer: $1,200

**LTV estimate:**
- Average customer lifetime: 2 years (startups churn tools, but the ones that buy credits are locked into the workflow)
- LTV: $1,200 × 2 = **$2,400 per converted customer**

---

## CAC at each GTM channel

| Channel | Effort | Est. visitors/mo | Audit completion rate | Email capture rate | Consult booking rate | Credit purchase rate | CAC |
|---------|--------|-------------------|----------------------|-------------------|---------------------|---------------------|-----|
| Hacker News (Show HN) | 1 post + replies | 300–500 (one-time spike) | 25% | 20% | 10% | 30% | ~$0 cash, ~4hrs time |
| Twitter thread | 1 thread/week | 100–300 | 20% | 15% | 8% | 25% | ~$0 cash, ~2hrs time |
| Reddit (r/SaaS, r/cursor) | 2 posts/week | 50–150 | 30% | 20% | 10% | 30% | ~$0 cash, ~1hr time |
| Direct founder DMs | 20 DMs/week | N/A | 60% | 50% | 20% | 35% | ~$0 cash, ~3hrs time |
| Organic (shareable URL) | 0 | Unpredictable | 35% | 25% | 12% | 30% | $0 |

**Worked example — HN post:**
- 400 visitors → 100 audits completed → 20 emails captured → 2 consult bookings → 0.6 credit purchases
- Revenue: 0.6 × $2,000 = $1,200 gross, $360 gross profit
- CAC: 4 hours of founder time. At $100/hr opportunity cost = $400 CAC against $360 GP (near breakeven on first purchase, profitable on repurchase)

**At scale with paid distribution (hypothetical):**
- If Credex ran LinkedIn ads to technical founders: CPM ~$80, CTR ~0.5%, CPC ~$16
- 100 clicks → 25 audits → 5 emails → 0.5 consult → 0.15 purchases
- Ad spend per purchase: $1,600 / 0.15 = ~$10,700 CAC — not viable at this margin
- Conclusion: this tool only works economically with organic/earned distribution. Paid doesn't pencil.

---

## Conversion funnel

```
Visitor lands on page
        ↓ 25% complete audit
Audit completed
        ↓ 20% capture email
Email captured
        ↓ 15% of high-value leads book consult
Consult booked
        ↓ 40% of consults purchase credits
Credit purchased
```

**Blended funnel math:**
- 1,000 visitors → 250 audits → 50 emails
- Of 50 emails: ~15 are high-value (>$500/mo savings identified)
- 15 high-value leads → 2.25 consults booked → 0.9 purchases
- Revenue per 1,000 visitors: 0.9 × $2,000 = $1,800 gross, $540 GP

**What makes this profitable:**
The tool's CAC is near zero at organic scale. The constraint is not conversion rate — it's traffic. Every 1,000 organic visitors produces ~$540 in gross profit with no ad spend. At 5,000 visitors/month, that's $2,700 GP/month from the audit tool alone, before any direct sales or repeat purchases.

---

## What would have to be true for $1M ARR in 18 months

**$1M ARR = $83,333/mo in revenue**

At $2,000 average credit purchase and 2 purchases/year per customer:
- Need ~250 active customers purchasing credits
- Need to acquire ~17 new purchasing customers per month for 18 months

**Working backward from the funnel:**
- 17 purchases/month requires 43 consults/month (at 40% close rate)
- 43 consults requires 285 high-value email captures/month (at 15% consult booking)
- 285 high-value emails requires ~1,900 total email captures/month (high-value = 15% of captures)
- 1,900 emails requires ~9,500 audit completions/month (at 20% email capture)
- 9,500 audits requires ~38,000 visitors/month (at 25% audit completion)

**38,000 visitors/month in 18 months — is that achievable?**

- Month 1–3: 2,000–5,000/mo via HN, Reddit, Twitter seeding
- Month 4–6: 5,000–10,000/mo as shareable URLs compound + SEO starts indexing audit pages
- Month 7–12: 10,000–25,000/mo if one viral moment hits (a founder with 50k followers shares their audit)
- Month 13–18: 25,000–40,000/mo with SEO on "AI tool cost comparison" queries + steady content

**What else has to be true:**
1. Credex's sales process converts consults to purchases at 40%+ — if it's lower, the whole funnel breaks
2. The shareable URL drives at least 20% of traffic organically — without this, we're entirely dependent on founder time for content
3. Pricing data stays current — one wrong savings number that a user catches destroys trust and word-of-mouth
4. Credex can actually supply credits for the tools users are audited on — if supply dries up for Cursor or Claude, the CTA becomes hollow

**Honest assessment:**
$1M ARR in 18 months is possible but requires a viral moment that isn't guaranteed. The conservative case — steady organic growth with no single breakout — gets to $200–$400K ARR in 18 months. The $1M case requires the shareable URL mechanic to work, meaning users with real audiences share their audits publicly. That's a product bet, not just a distribution bet.