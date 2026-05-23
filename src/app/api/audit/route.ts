import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { audits } from "@/lib/db/schema";
import { runAudit } from "@/lib/audit-engine";
import { generateAuditSummary } from "@/lib/gemini";
import { auditFormSchema } from "@/lib/form-schema";
import type { AuditInputData } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
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