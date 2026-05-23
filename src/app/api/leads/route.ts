import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads, audits } from "@/lib/db/schema";
import { Resend } from "resend";
import { HIGH_VALUE_SAVINGS_THRESHOLD } from "@/lib/pricing-data";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const leadSchema = z.object({
    auditId: z.string().min(1),
    email: z.string().email(),
    company: z.string().max(200).optional(),
    role: z.string().max(200).optional(),
    // honeypot — if filled, it's a bot
    website: z.string().max(0, "bot").optional(),
});

export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    console.log(`Lead capture from IP: ${ip}`);

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ message: "Invalid request" }, { status: 422 });
    }

    // Honeypot check
    if (parsed.data.website) {
        return NextResponse.json({ ok: true }, { status: 200 });
    }

    const { auditId, email, company, role } = parsed.data;

    const audit = await db.query.audits.findFirst({
        where: eq(audits.id, auditId),
    });

    if (!audit) {
        return NextResponse.json({ message: "Audit not found" }, { status: 404 });
    }

    const existing = await db.query.leads.findFirst({
        where: eq(leads.auditId, auditId),
    });

    if (existing) {
        return NextResponse.json({ ok: true }, { status: 200 });
    }

    const totalMonthlySavings = audit.resultData.totalMonthlySavings;
    const isHighValue = totalMonthlySavings >= HIGH_VALUE_SAVINGS_THRESHOLD;

    const leadId = nanoid(10);

    try {
        await db.insert(leads).values({
            id: leadId,
            auditId,
            email,
            companyName: company ?? null,
            role: role ?? null,
            teamSize: audit.inputData.teamSize,
            totalMonthlySavings,
            isHighValue,
            emailSent: false,
        });
    } catch (err) {
        console.error("Lead insert failed:", err);
        return NextResponse.json({ message: "Failed to save. Try again." }, { status: 500 });
    }

    try {
        const emailResult = await resend.emails.send({
            from: "Tarka AI Audit <onboarding@resend.dev>",
            to: email,
            subject:
                totalMonthlySavings > 0
                    ? `Your AI spend audit — $${totalMonthlySavings}/mo in savings found`
                    : "Your AI spend audit — you're already running lean",
            html: buildEmailHtml({
                email,
                company,
                totalMonthlySavings,
                isHighValue,
                auditId,
            }),
        });

        console.log("Resend result:", emailResult);

        if (emailResult.error) {
            console.error("Resend error:", emailResult.error);
        } else {
            await db
                .update(leads)
                .set({ emailSent: true })
                .where(eq(leads.id, leadId));
        }
    } catch (err) {
        console.error("Resend email failed:", err);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
}

function buildEmailHtml({
    email,
    company,
    totalMonthlySavings,
    isHighValue,
    auditId,
}: {
    email: string;
    company?: string;
    totalMonthlySavings: number;
    isHighValue: boolean;
    auditId: string;
}) {
    const auditUrl = `https://tarka-ai.vercel.app/audit/${auditId}`;
    const greeting = company ? `Hi ${company} team,` : "Hi,";

    const savingsBlock =
        totalMonthlySavings > 0
            ? `<p>Your audit found <strong>$${totalMonthlySavings}/month ($${totalMonthlySavings * 12}/year)</strong> in potential savings across your AI tool stack.</p>`
            : `<p>Good news: your AI stack is already well-optimized. We'll reach out when new savings opportunities appear.</p>`;

    const credexBlock = isHighValue
        ? `<p style="margin-top:16px;padding:16px;background:#f0fdf4;border-left:3px solid #10b981;border-radius:4px;">
        With over $500/mo in identified savings, you qualify for a Tarka AI consultation.
        We source discounted AI infrastructure credits — same tools, lower cost.
        <br/><br/>
        <a href="https://TarkaAI.rocks" style="color:#059669;font-weight:600;">Book a free consultation →</a>
       </p>`
        : "";

    return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b;">
  <p>${greeting}</p>
  ${savingsBlock}
  <p>
    <a href="${auditUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
      View your full audit →
    </a>
  </p>
  ${credexBlock}
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;" />
  <p style="font-size:12px;color:#71717a;">
    You're receiving this because you ran an AI spend audit at Tarka AI.rocks.
    <br/>
    <a href="#" style="color:#71717a;">Unsubscribe</a>
  </p>
</body>
</html>`;
}