import {
  getToolById,
  getPlanById,
  TEAM_PLAN_MIN_SENSIBLE_SEATS,
  type UseCase,
} from "./pricing-data";
import type {
  ToolInput,
  AuditInputData,
  AuditResultData,
  ToolRecommendation,
} from "./db/schema";

export function runAudit(input: AuditInputData): AuditResultData {
  const recommendations: ToolRecommendation[] = input.tools.map((toolInput) =>
    auditTool(toolInput, input.teamSize, input.useCase)
  );

  const totalCurrentSpend = recommendations.reduce(
    (sum, r) => sum + r.currentMonthlySpend,
    0
  );
  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.monthlySavings,
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;

  const optimizationScore = computeOptimizationScore(
    totalCurrentSpend,
    totalMonthlySavings
  );

  return {
    recommendations,
    totalCurrentSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    optimizationScore,
    aiSummary: null, 
    generatedAt: new Date().toISOString(),
  };
}


function auditTool(
  input: ToolInput,
  teamSize: number,
  useCase: UseCase
): ToolRecommendation {
  const tool = getToolById(input.toolId);

  if (!tool) {
    return makeKeepRecommendation(input, input.monthlySpend, "Tool not found in our database.");
  }

  const currentPlan = getPlanById(input.toolId, input.planId);

  const effectivePricePerSeat = currentPlan?.pricePerSeat ?? 0;

  if (tool.category === "api") {
    return auditApiTool(input, tool, useCase);
  }

  const isTeamOrHigher =
    input.planId === "team" ||
    input.planId === "business" ||
    input.planId === "enterprise";

  if (isTeamOrHigher && input.seats < TEAM_PLAN_MIN_SENSIBLE_SEATS) {
    const proPlan = getPlanById(input.toolId, "pro") ??
                   getPlanById(input.toolId, "individual");

    if (proPlan && proPlan.pricePerSeat < effectivePricePerSeat) {
      const projectedSpend = proPlan.pricePerSeat * input.seats;
      const currentSpend = input.monthlySpend;
      const savings = currentSpend - projectedSpend;

      if (savings > 0) {
        return {
          toolId: input.toolId,
          toolName: tool.name,
          currentPlan: input.planId,
          currentMonthlySpend: currentSpend,
          recommendedAction: "downgrade",
          recommendedPlan: proPlan.id,
          projectedMonthlySpend: projectedSpend,
          monthlySavings: savings,
          annualSavings: savings * 12,
          reasoning: `${tool.name} ${currentPlan?.name ?? "Team"} at $${effectivePricePerSeat}/seat is designed for teams of ${TEAM_PLAN_MIN_SENSIBLE_SEATS}+. With ${input.seats} seat${input.seats > 1 ? "s" : ""}, ${proPlan.name} at $${proPlan.pricePerSeat}/seat delivers the same core capability for $${savings}/mo less.`,
          credexApplicable: tool.credexAvailable,
        };
      }
    }
  }

  const cheaperSameTool = tool.plans
    .filter(
      (p) =>
        p.pricePerSeat < effectivePricePerSeat &&
        p.pricePerSeat > 0 &&
        p.bestFor.includes(useCase) &&
        (p.minSeats === undefined || p.minSeats <= input.seats)
    )
    .sort((a, b) => b.pricePerSeat - a.pricePerSeat)[0];

  if (cheaperSameTool) {
    const projectedSpend = cheaperSameTool.pricePerSeat * input.seats;
    const savings = input.monthlySpend - projectedSpend;

    if (savings > 5) { 
      return {
        toolId: input.toolId,
        toolName: tool.name,
        currentPlan: input.planId,
        currentMonthlySpend: input.monthlySpend,
        recommendedAction: "downgrade",
        recommendedPlan: cheaperSameTool.id,
        projectedMonthlySpend: projectedSpend,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reasoning: `${tool.name} ${cheaperSameTool.name} covers all ${useCase} use cases at $${cheaperSameTool.pricePerSeat}/seat vs your current $${effectivePricePerSeat}/seat — the higher-tier features (${(currentPlan?.features ?? []).slice(-2).join(", ")}) are unused for a ${useCase}-focused team.`,
        credexApplicable: tool.credexAvailable,
      };
    }
  }

  const savingsFloor = input.monthlySpend * 0.2;

  const bestAlternative = tool.alternatives
    .filter((alt) => {
      if (!alt.bestFor.includes(useCase)) return false;
      const altSavings = input.monthlySpend - alt.pricePerSeat * input.seats;
      return altSavings > savingsFloor && altSavings > 10;
    })
    .sort((a, b) => {
      const savingsA = input.monthlySpend - a.pricePerSeat * input.seats;
      const savingsB = input.monthlySpend - b.pricePerSeat * input.seats;
      return savingsB - savingsA;
    })[0];

  if (bestAlternative) {
    const projectedSpend = bestAlternative.pricePerSeat * input.seats;
    const savings = input.monthlySpend - projectedSpend;

    return {
      toolId: input.toolId,
      toolName: tool.name,
      currentPlan: input.planId,
      currentMonthlySpend: input.monthlySpend,
      recommendedAction: "switch",
      recommendedTool: bestAlternative.toolId,
      projectedMonthlySpend: projectedSpend,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reasoning: `${bestAlternative.toolName} ${bestAlternative.planName} saves $${savings}/mo for ${input.seats} seat${input.seats > 1 ? "s" : ""} with comparable ${useCase} capability. ${bestAlternative.capabilityNote}`,
      credexApplicable: tool.credexAvailable,
    };
  }

  if (tool.credexAvailable && input.monthlySpend > 0) {
    const credexSavings = Math.round(input.monthlySpend * 0.25);
    if (credexSavings > 10) {
      return {
        toolId: input.toolId,
        toolName: tool.name,
        currentPlan: input.planId,
        currentMonthlySpend: input.monthlySpend,
        recommendedAction: "credits",
        projectedMonthlySpend: input.monthlySpend - credexSavings,
        monthlySavings: credexSavings,
        annualSavings: credexSavings * 12,
        reasoning: `${tool.name} ${currentPlan?.name ?? ""} is already the right plan for your use case. Discounted credits through Credex could reduce this bill by ~25% without changing anything about your workflow.`,
        credexApplicable: true,
      };
    }
  }

  return makeKeepRecommendation(
    input,
    input.monthlySpend,
    `${tool.name} ${currentPlan?.name ?? ""} is well-matched to your team size and ${useCase} use case. No cheaper option offers equivalent capability.`
  );
}

function auditApiTool(
  input: ToolInput,
  tool: ReturnType<typeof getToolById> & {},
  useCase: UseCase
): ToolRecommendation {
  if (input.monthlySpend > 200 && tool.credexAvailable) {
    const credexSavings = Math.round(input.monthlySpend * 0.25);
    return {
      toolId: input.toolId,
      toolName: tool.name,
      currentPlan: input.planId,
      currentMonthlySpend: input.monthlySpend,
      recommendedAction: "credits",
      projectedMonthlySpend: input.monthlySpend - credexSavings,
      monthlySavings: credexSavings,
      annualSavings: credexSavings * 12,
      reasoning: `API spend of $${input.monthlySpend}/mo is a strong candidate for discounted credits. Credex sources overforecast infrastructure — the same API access, ~25% off retail pricing.`,
      credexApplicable: true,
    };
  }

  const altApi = tool.alternatives.find((a) => a.bestFor.includes(useCase));
  if (altApi && input.monthlySpend > 50) {
    return {
      toolId: input.toolId,
      toolName: tool.name,
      currentPlan: input.planId,
      currentMonthlySpend: input.monthlySpend,
      recommendedAction: "switch",
      recommendedTool: altApi.toolId,
      projectedMonthlySpend: input.monthlySpend * 0.8, 
      monthlySavings: Math.round(input.monthlySpend * 0.2),
      annualSavings: Math.round(input.monthlySpend * 0.2) * 12,
      reasoning: `${altApi.capabilityNote} Actual savings depend on your token mix — worth benchmarking both APIs on your workload.`,
      credexApplicable: tool.credexAvailable,
    };
  }

  return makeKeepRecommendation(
    input,
    input.monthlySpend,
    `API spend looks reasonable at $${input.monthlySpend}/mo. Without token-level usage data, we can't compute precise savings — but consider enabling cost alerts in your API dashboard.`
  );
}

//helper
function makeKeepRecommendation(
  input: ToolInput,
  currentSpend: number,
  reasoning: string
): ToolRecommendation {
  const tool = getToolById(input.toolId);
  return {
    toolId: input.toolId,
    toolName: tool?.name ?? input.toolId,
    currentPlan: input.planId,
    currentMonthlySpend: currentSpend,
    recommendedAction: "keep",
    projectedMonthlySpend: currentSpend,
    monthlySavings: 0,
    annualSavings: 0,
    reasoning,
    credexApplicable: false,
  };
}

function computeOptimizationScore(
  totalCurrentSpend: number,
  totalMonthlySavings: number
): number {
  if (totalCurrentSpend === 0) return 100;
  const wasteRatio = totalMonthlySavings / totalCurrentSpend;
  return Math.max(0, Math.round(100 - wasteRatio * 200));
}

export { auditTool, computeOptimizationScore };