import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditInputData, AuditResultData } from "@/lib/db/schema";

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenerativeAI(key);
}

function buildPrompt(input: AuditInputData, result: AuditResultData): string {
  const toolLines = result.recommendations
    .map((r) => {
      if (r.recommendedAction === "keep") {
        return `- ${r.toolName}: already optimal`;
      }
      return `- ${r.toolName}: ${r.recommendedAction} → save $${r.monthlySavings}/mo. ${r.reasoning}`;
    })
    .join("\n");

  return `You are a blunt, numbers-first AI spending advisor writing for a startup founder or engineering manager.

Context:
- Team size: ${input.teamSize}
- Primary use case: ${input.useCase}
- Total current AI spend: $${result.totalCurrentSpend}/mo
- Total potential savings: $${result.totalMonthlySavings}/mo ($${result.totalAnnualSavings}/yr)
- Optimization score: ${result.optimizationScore}/100

Per-tool findings:
${toolLines}

Write a single paragraph of exactly 80–120 words. Rules:
1. Open with the biggest single saving opportunity by dollar amount.
2. Mention the optimization score and what it means for this team.
3. If total savings > $500/mo, mention that discounted AI credits could compound these savings further.
4. If total savings < $100/mo, be honest — tell them they're already running lean.
5. No bullet points. No headers. No markdown. Plain prose only.
6. Do not use the word "leverage". Do not use "unlock". Do not use "supercharge".
7. Sound like a CFO giving a peer a straight answer, not a SaaS marketing page.`;
}

function buildFallbackSummary(
  input: AuditInputData,
  result: AuditResultData
): string {
  if (result.totalMonthlySavings < 100) {
    return `Your team of ${input.teamSize} is running a lean AI stack with an optimization score of ${result.optimizationScore}/100. At $${result.totalCurrentSpend}/mo total spend, there's minimal waste — your current plan choices are well-matched to your ${input.useCase} use case. We'll flag new savings opportunities as pricing changes.`;
  }

  const topSaving = [...result.recommendations].sort(
    (a, b) => b.monthlySavings - a.monthlySavings
  )[0];

  const credexNote =
    result.totalMonthlySavings > 500
      ? " Discounted AI credits through Credex could compound these savings further without changing your workflow."
      : "";

  return `Your team of ${input.teamSize} has an optimization score of ${result.optimizationScore}/100, with $${result.totalMonthlySavings}/mo in identified savings ($${result.totalAnnualSavings}/yr). The biggest opportunity is ${topSaving?.toolName ?? "your top tool"}, where ${topSaving?.reasoning ?? "a plan change could reduce spend"}. Across your full stack, switching to better-matched plans saves $${result.totalMonthlySavings} every month.${credexNote}`;
}

export async function generateAuditSummary(
  input: AuditInputData,
  result: AuditResultData
): Promise<string> {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = buildPrompt(input, result);
    const response = await model.generateContent(prompt);
    const text = response.response.text().trim();

    if (!text || text.length < 50) {
      console.warn("Gemini returned suspiciously short response, using fallback");
      return buildFallbackSummary(input, result);
    }

    return text;
  } catch (err) {
    console.error("Gemini summary generation failed:", err);
    return buildFallbackSummary(input, result);
  }
}