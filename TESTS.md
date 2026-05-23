# TESTS.md

## How to run

```bash
npm run test
```

Or in watch mode:

```bash
npm run test:watch
```

## Test file

`src/__tests__/audit-engine.test.ts`

All tests cover the audit engine specifically, as required. The audit engine is the core business logic — it's the only part of the codebase where a bug has real consequences (wrong savings numbers, wrong recommendations).

---

## Test coverage

### Rule 1 — Team plan overkill (3 tests)
| Test | What it covers |
|------|---------------|
| Cursor Business 2 seats → downgrade | Fires when seats < 3 on a team-tier plan. Verifies savings = $40 and recommendedPlan = "pro" |
| Claude Team 2 seats → downgrade | Same rule, different tool. Verifies savings = $20 |
| Cursor Business 3 seats — no flag | Rule 1 must NOT fire at exactly the threshold. Prevents false positives |

### Rule 2 — Cheaper same-vendor plan (1 test)
| Test | What it covers |
|------|---------------|
| GitHub Copilot Enterprise → downgrade | Verifies cheaper same-tool plan is surfaced when the current plan has unused features |

### Rule 3 — Cheaper alternative tool (1 test)
| Test | What it covers |
|------|---------------|
| No switch when savings < 20% | The 20% floor prevents noise. Verifies we don't recommend a $0-savings tool switch |

### Rule 4 — Credex credits (2 tests)
| Test | What it covers |
|------|---------------|
| Anthropic API $300/mo → credits | Verifies 25% savings calculation ($75) and credexApplicable = true |
| OpenAI API $400/mo → credits | Same rule, different API tool. Verifies $100 savings |

### Already optimal — no manufactured savings (2 tests)
| Test | What it covers |
|------|---------------|
| ChatGPT Plus single seat → keep | Verifies we don't manufacture savings when plan is correct |
| optimizationScore = 100 when no savings | Score ceiling check |

### Total savings aggregation (2 tests)
| Test | What it covers |
|------|---------------|
| Multi-tool savings sum | Runs the exact test case from the spec: Cursor + Claude + ChatGPT + Anthropic API. Verifies $135/mo, $1620/yr, $460 current spend |
| Annual = 12x monthly | Invariant check — annual savings must always equal monthly × 12 |

### Edge cases (4 tests)
| Test | What it covers |
|------|---------------|
| Unknown toolId — no throw | Engine must not crash on unrecognised input |
| Unknown toolId → keep | Graceful fallback returns "keep" action |
| Score = 0 at 50%+ waste | Score floor check |
| Score never below 0 | Math.max(0) guard works even with extreme inputs |

---

## Total: 15 tests across 6 describe blocks

All tests are pure unit tests — no DB, no network, no API calls. The audit engine is a pure function: `(AuditInputData) => AuditResultData`. Fast, deterministic, no mocking needed.