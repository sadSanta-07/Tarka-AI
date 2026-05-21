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
4. Optimization score meaning:
- 80–100 = highly optimized / lean
- 50–79 = moderate optimization opportunities
- 0–49 = significant overspending or plan mismatch
5. No bullet points. No headers. No markdown. Plain prose only.
6. Do not use the word "leverage". Do not use "unlock". Do not use "supercharge".
7. Sound like a CFO giving a peer a straight answer, not a SaaS marketing page.`;
}

function buildFallbackSummary(
  input: AuditInputData,
  result: AuditResultData
): string {
  const score = result.optimizationScore;

  const scoreMeaning =
    score >= 80
      ? "running a lean and well-optimized AI stack"
      : score >= 50
        ? "moderately optimized, with some cost reduction opportunities"
        : "materially overpaying for parts of your AI stack";

  const topSaving = [...result.recommendations].sort(
    (a, b) => b.monthlySavings - a.monthlySavings
  )[0];

  const credexNote =
    result.totalMonthlySavings > 500
      ? " Discounted AI credits through Tarka AI could reduce costs even further without changing your workflow."
      : "";

  return `Your team of ${input.teamSize} is ${scoreMeaning}, with an optimization score of ${score}/100. Current spend is $${result.totalCurrentSpend}/mo, with potential savings of $${result.totalMonthlySavings}/mo ($${result.totalAnnualSavings}/yr). The biggest opportunity is ${topSaving?.toolName ?? "your current stack"}, where ${topSaving?.reasoning ?? "a pricing adjustment could reduce costs"}${credexNote}`;
}

export async function generateAuditSummary(
  input: AuditInputData,
  result: AuditResultData
): Promise<string> {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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