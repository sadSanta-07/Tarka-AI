import { describe, it, expect } from "vitest";
import { runAudit, computeOptimizationScore } from "@/lib/audit-engine";
import type { AuditInputData, ToolInput } from "@/lib/db/schema";


function makeInput(
  tools: ToolInput[],
  teamSize = 5,
  useCase: AuditInputData["useCase"] = "coding"
): AuditInputData {
  return { tools, teamSize, useCase };
}

describe("Rule 1 — team plan overkill", () => {
  it("recommends downgrade when Cursor Business used with 2 seats", () => {
    const result = runAudit(
      makeInput([{ toolId: "cursor", planId: "business", seats: 2, monthlySpend: 80 }])
    );
    const rec = result.recommendations[0];
    expect(rec.recommendedAction).toBe("downgrade");
    expect(rec.monthlySavings).toBe(40); 
    expect(rec.recommendedPlan).toBe("pro");
  });

  it("recommends downgrade when Claude Team used with 2 seats", () => {
    const result = runAudit(
      makeInput([{ toolId: "claude", planId: "team", seats: 2, monthlySpend: 60 }], 2, "writing")
    );
    const rec = result.recommendations[0];
    expect(rec.recommendedAction).toBe("downgrade");
    expect(rec.monthlySavings).toBe(20);
  });

  it("does NOT flag team plan when seats >= 3", () => {
    const result = runAudit(
      makeInput([{ toolId: "cursor", planId: "business", seats: 3, monthlySpend: 120 }])
    );
    const rec = result.recommendations[0];
    expect(rec.monthlySavings).toBeGreaterThanOrEqual(0);
    if (rec.recommendedAction === "downgrade") {
      expect(rec.reasoning).not.toContain("designed for teams of");
    }
  });
});


describe("Rule 2 — cheaper same-vendor plan", () => {
  it("flags GitHub Copilot Enterprise when Individual covers coding needs", () => {
    const result = runAudit(
      makeInput([{ toolId: "github_copilot", planId: "enterprise", seats: 1, monthlySpend: 39 }])
    );
    const rec = result.recommendations[0];
    expect(rec.recommendedAction).toBe("downgrade");
    expect(rec.monthlySavings).toBeGreaterThan(5);
  });
});


describe("Rule 3 — cheaper alternative tool", () => {
  it("does not recommend switch if savings < 20% of current spend", () => {
    const result = runAudit(
      makeInput([{ toolId: "cursor", planId: "pro", seats: 1, monthlySpend: 20 }])
    );
    const rec = result.recommendations[0];

    expect(rec.monthlySavings).toBeLessThanOrEqual(5);
  });
});



describe("Rule 4 — Credex credits", () => {
  it("recommends credits for Anthropic API spend over $200", () => {
    const result = runAudit(
      makeInput([{ toolId: "anthropic_api", planId: "api", seats: 1, monthlySpend: 300 }])
    );
    const rec = result.recommendations[0];
    expect(rec.recommendedAction).toBe("credits");
    expect(rec.monthlySavings).toBe(75);
    expect(rec.credexApplicable).toBe(true);
  });

  it("recommends credits for OpenAI API spend over $200", () => {
    const result = runAudit(
      makeInput([{ toolId: "openai_api", planId: "api", seats: 1, monthlySpend: 400 }])
    );
    const rec = result.recommendations[0];
    expect(rec.recommendedAction).toBe("credits");
    expect(rec.monthlySavings).toBe(100); 
  });
});


describe("already optimal — no manufactured savings", () => {
  it("returns keep for ChatGPT Plus single seat mixed use", () => {
    const result = runAudit(
      makeInput([{ toolId: "chatgpt", planId: "plus", seats: 1, monthlySpend: 20 }], 3, "mixed")
    );
    const rec = result.recommendations[0];
    expect(rec.recommendedAction).toBe("keep");
    expect(rec.monthlySavings).toBe(0);
  });

  it("returns optimizationScore of 100 when no savings found", () => {
    const score = computeOptimizationScore(100, 0);
    expect(score).toBe(100);
  });
});


describe("total savings calculation", () => {
  it("correctly sums savings across multiple tools", () => {
    const result = runAudit(
      makeInput([
        { toolId: "cursor", planId: "business", seats: 2, monthlySpend: 80 },
        { toolId: "claude", planId: "team", seats: 2, monthlySpend: 60 },
        { toolId: "chatgpt", planId: "plus", seats: 1, monthlySpend: 20 },
        { toolId: "anthropic_api", planId: "api", seats: 1, monthlySpend: 300 },
      ])
    );
    expect(result.totalMonthlySavings).toBe(135); 
    expect(result.totalAnnualSavings).toBe(1620); 
    expect(result.totalCurrentSpend).toBe(460);  
  });

  it("annual savings is always 12x monthly savings", () => {
    const result = runAudit(
      makeInput([{ toolId: "cursor", planId: "business", seats: 2, monthlySpend: 80 }])
    );
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });
});


describe("edge cases", () => {
  it("handles unknown toolId gracefully without throwing", () => {
    expect(() =>
      runAudit(makeInput([{ toolId: "nonexistent_tool", planId: "pro", seats: 1, monthlySpend: 50 }]))
    ).not.toThrow();
  });

  it("returns keep for unknown tool", () => {
    const result = runAudit(
      makeInput([{ toolId: "nonexistent_tool", planId: "pro", seats: 1, monthlySpend: 50 }])
    );
    expect(result.recommendations[0].recommendedAction).toBe("keep");
  });

  it("optimization score is 0 when 50%+ of spend is waste", () => {
    const score = computeOptimizationScore(100, 60);
    expect(score).toBe(0);
  });

  it("optimization score never goes below 0", () => {
    const score = computeOptimizationScore(100, 200);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});