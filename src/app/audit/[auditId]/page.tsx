import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { audits } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AuditResults } from "@/components/audit-results";
import type { Metadata } from "next";

type Props = { params: Promise<{ auditId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { auditId } = await params;
  const audit = await db.query.audits.findFirst({
    where: eq(audits.id, auditId),
  });

  if (!audit) return { title: "Audit not found" };

  const savings = audit.resultData.totalMonthlySavings;
  const title =
    savings > 0
      ? `Save $${savings}/mo on AI tools — Tarka AI Audit`
      : "Your AI Spend Audit — Tarka AI";
  const description =
    savings > 0
      ? `This team could save $${savings}/mo ($${audit.resultData.totalAnnualSavings}/yr) by optimizing their AI tool stack.`
      : "Your AI tool stack is already well-optimized.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://your-domain.com/audit/${auditId}`,
      siteName: "Tarka AI Spend Audit",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AuditPage({ params }: Props) {
  const { auditId } = await params;

  const audit = await db.query.audits.findFirst({
    where: eq(audits.id, auditId),
  });

  if (!audit) notFound();

  return <AuditResults audit={audit} />;
}
