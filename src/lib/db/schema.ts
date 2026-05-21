import { pgTable, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

// ─── Types for the JSON blobs ────────────────────────────────────────────────

export type ToolInput = {
  toolId: string;        // e.g. "cursor", "chatgpt"
  plan: string;          // e.g. "pro", "business"
  seats: number;
  monthlySpend: number;  // what they say they pay (USD)
};

export type AuditInputData = {
  tools: ToolInput[];
  teamSize: number;
  useCase: "coding" | "writing" | "data" | "research" | "mixed";
};

export type ToolRecommendation = {
  toolId: string;
  toolName: string;
  currentPlan: string;
  currentMonthlySpend: number;
  recommendedAction: "downgrade" | "switch" | "keep" | "credits";
  recommendedPlan?: string;
  recommendedTool?: string;
  projectedMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;          // the defensible 1-sentence reason
  credexApplicable: boolean;  // can Credex credits help here?
};

export type AuditResultData = {
  recommendations: ToolRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  totalCurrentSpend: number;
  optimizationScore: number;  // 0–100, how well-optimized they already are
  aiSummary: string | null;   // Gemini-generated paragraph, null if API failed
  generatedAt: string;        // ISO timestamp
};

// ─── Tables ──────────────────────────────────────────────────────────────────

export const audits = pgTable("audits", {
  id: text("id").primaryKey(),               // nanoid slug, also the public URL key
  inputData: jsonb("input_data").$type<AuditInputData>().notNull(),
  resultData: jsonb("result_data").$type<AuditResultData>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // soft link back to lead (nullable — audit exists before email is captured)
  leadId: text("lead_id"),
});

export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  auditId: text("audit_id").notNull().references(() => audits.id),
  email: text("email").notNull(),
  companyName: text("company_name"),
  role: text("role"),
  teamSize: integer("team_size"),
  // derived from audit at capture time — avoids a join on every email check
  totalMonthlySavings: integer("total_monthly_savings").notNull(),
  isHighValue: boolean("is_high_value").notNull(), // savings > $500/mo
  emailSent: boolean("email_sent").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});