# USER_INTERVIEWS.md

Three conversations with potential users conducted during the build week. Each was informal WhatsApp chat or group discussion but produced genuine insight that influenced the product.

---

## Interview 1 A.P., Startup Builder, Workik AI

**Date:** 2026-05-26
**Duration:** ~15 minutes
**Format:** WhatsApp chat
**Background:** Priya is building a productivity dashboard that integrates multiple services. She actively uses the Anthropic Claude API in both development and product workflows not casually, but as a core part of how she builds.

**Direct quotes:**

- On how embedded AI is in her workflow: *"like its in my veins tbh"*
- On unexpected API costs hitting her: *"fk..yupp"* (unprompted, when asked if surprise bills happen)
- On how she currently tracks spending: *"Ig I use some extensions or some spending trackers or the bank statements"*
- On the emotional experience of API costs: *"My money gets flushed like some game I am playing game irl"*
- On prompt optimization: *"I do optimize them and it is super annoying and painful"*
- On her reaction to the audit tool concept: *"it really sounds cool and would help me save my money to buy some extra red bulls"*

**Most surprising thing she said:**

She actively optimizes prompts, uses browser extensions, and watches bank statements and still has no clear picture of where her API money is going. The tooling she uses was built for other purposes (bank apps, general spend trackers) not for API cost visibility. Even highly technical users relied on indirect tools like bank statements and browser extensions rather than purpose-built visibility tooling.

**What it changed about the design:**

The original framing of the tool was "find waste." This conversation made clear the pain is actually two things: high costs AND lack of visibility into why costs are high. Added the optimization score (0–100) to the results page to give users a single number that captures not just savings but overall spend health. The score addresses the visibility gap, not just the savings gap.

---

## Interview 2 Group discussion, Engineers at HackerRank, BNY Mellon, and early-stage startups

**Date:** 2026-05-26
**Duration:** ~20 minutes
**Format:** Group chat, 4–5 participants (interns and junior engineers at the above companies)
**Background:** Mix of developers using AI tools professionally some on company-provided plans, some on personal subscriptions, some exploiting free tiers strategically.

**Direct quotes:**

- On how token pricing is spreading: *"most pay for a plan, but the token thing is very common as well"*
- On companies subsidizing AI usage for developers: *"theyre paying devs to be lazy"*
- On strategically exploiting free credits: *"i got 20 wala on my personal account, exploiting that nicely too"*
- On token conservation as a skill: *"it'd get your work done if you conserve tokens"*
- On confusion about token economics: *"wait, companies subsidise tokens?"* / *"like pay for using tokens?"* two separate people in the same conversation genuinely unsure how it works

**Most surprising thing they said:**

The confusion about token subsidization was striking. These are technically strong developers, some at large financial institutions and top tech companies and several genuinely didn't understand how token pricing or company-sponsored credits worked. They were treating token limits like a gaming resource to exploit rather than a cost their employer was absorbing. One person actively "exploiting" their free tier had no idea what that cost their company.

**What it changed about the design:**

This conversation suggested that explainability matters as much as analytics. The audit tool's per-tool reasoning strings the one-sentence explanation for every recommendation became more important after this. Users don't just want to know they're overspending; they want to understand *why* a plan costs what it does and whether their usage pattern is normal. The reasoning field in `ToolRecommendation` was already there architecturally, but this conversation made me write each reasoning string more carefully plain English, not just a number.

---

## Interview 3 R.S., Engineering Student & Intern, ONGC

**Date:** 2026-05-26
**Duration:** ~10 minutes
**Format:** WhatsApp chat
**Background:** Studies at SVNIT, currently interning at ONGC. Follows the AI industry closely and thinks about AI adoption at the enterprise and policy level not just as a developer but as someone watching where the industry is heading economically.

**Direct quotes:**

- On the tool's potential: *"this can be a really great idea if we execute it at large scale and it checks with the thousands of models present"*
- On Microsoft's recent move to restrict internal AI usage: *"the cost behind the usage is more than the manpower ones - so now they have to take these steps"*
- On what the industry headlines are actually signalling: *"it's not AI downfall infra, security, core systems are separate from AI growth"*

**Most surprising thing he said:**

He immediately connected Tarka AI to a macro trend that broke as a headline the same day He interpreted Microsoft's recent restrictions as evidence that infrastructure costs are becoming a serious operational concern. His framing was sharp: the problem isn't that AI is failing, it's that nobody has properly priced it against the value it delivers. An audit tool that makes that cost visible is exactly the kind of tooling enterprises need right now - and the timing couldn't be better.

**What it changed about the product thinking:**

This conversation shifted how I think about the long-term positioning of the tool. The current MVP targets startups and small teams. But the real enterprise problem where Microsoft-scale companies are making headlines about AI cost overruns is the same problem at 100x the scale. The audit engine's logic (are you on the right plan, are you paying retail when credits exist) applies directly to enterprise procurement. A future version that handles thousands of models and enterprise API contracts would be a meaningfully different product but the core insight is identical. This interview made the ECONOMICS.md $1M ARR scenario feel more grounded, not less.

---

## Cross-interview patterns

Three things came up consistently across all three conversations:

**1. Fragmented tracking.** None of the people interviewed had a single place. Bank statements, browser extensions, vague memory. The problem isn't that people don't care it's that no tool exists for this specific use case.

**2. Emotional relationship with cost.** "Money getting flushed like a game," token limits as something to "exploit" AI spend has a different emotional texture than normal SaaS spend. It feels volatile and hard to control, even for technical users who understand the underlying model.

**3. The education gap.** Multiple people were confused about how token pricing, company subsidization, and credit systems actually work. An audit tool that only shows numbers without explaining them misses half the value.

**4. These conversations suggest growing demand for AI cost visibility** The Microsoft news breaking on the same day as the third interview wasn't coincidence - it's the same underlying problem at enterprise scale. Cost visibility for AI tooling is becoming a boardroom conversation, not just a startup founder's headache. The conversations suggest that AI cost governance may be becoming a more urgent operational problem than I initially assumed.