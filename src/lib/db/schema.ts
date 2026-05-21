import { pgTable, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export type ToolInput = {
  toolId: string;        
  planId: string;         
  seats: number;
  monthlySpend: number;  //(USD)
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
  reasoning: string;          
  credexApplicable: boolean;  
};

export type AuditResultData = {
  recommendations: ToolRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  totalCurrentSpend: number;
  optimizationScore: number;  
  aiSummary: string | null;   // Gemini generated para
};


export const audits = pgTable("audits", {
  id: text("id").primaryKey(),
  inputData: jsonb("input_data").$type<AuditInputData>().notNull(),
  resultData: jsonb("result_data").$type<AuditResultData>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  leadId: text("lead_id"),
});

export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  auditId: text("audit_id").notNull().references(() => audits.id),
  email: text("email").notNull(),
  companyName: text("company_name"),
  role: text("role"),
  teamSize: integer("team_size"),
  totalMonthlySavings: integer("total_monthly_savings").notNull(),
  isHighValue: boolean("is_high_value").notNull(),
  emailSent: boolean("email_sent").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});