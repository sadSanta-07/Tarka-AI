import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { audits } from "@/lib/db/schema";
import { runAudit } from "@/lib/audit-engine";
import { generateAuditSummary } from "@/lib/gemini";
import { auditFormSchema } from "@/lib/form-schema";
import type { AuditInputData } from "@/lib/db/schema";

const recentRequests = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = recentRequests.get(ip) ?? [];
  const recent = requests.filter(t => now - t < 60_000);
  recentRequests.set(ip, [...recent, now]);
  return recent.length >= 10;
}

export async function POST(req: NextRequest) {

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = auditFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid input", errors: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const inputData: AuditInputData = {
    tools: parsed.data.tools,
    teamSize: parsed.data.teamSize,
    useCase: parsed.data.useCase,
  };

  const resultData = runAudit(inputData);

  const aiSummary = await generateAuditSummary(inputData, resultData);
  resultData.aiSummary = aiSummary;

  const auditId = nanoid(10);

  try {
    await db.insert(audits).values({
      id: auditId,
      inputData,
      resultData,
    });
  } catch (err) {
    console.error("DB insert failed:", err);
    return NextResponse.json(
      { message: "Failed to save audit. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ auditId }, { status: 201 });
}