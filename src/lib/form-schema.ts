import { z } from "zod";

export const toolInputSchema = z.object({
  toolId: z.string().min(1, "Select a tool"),
  planId: z.string().min(1, "Select a plan"),
  seats: z.number().int().min(1, "At least 1 seat").max(10000),
  monthlySpend: z
    .number()
    .min(0, "Can't be negative")
    .max(1_000_000, "That seems high — double check"),
});

export const auditFormSchema = z.object({
  tools: z
    .array(toolInputSchema)
    .min(1, "Add at least one tool")
    .max(20, "Maximum 20 tools"),
  teamSize: z.number().int().min(1).max(100_000),
  useCase: z.enum(["coding", "writing", "data", "research", "mixed"]),
});

export type AuditFormValues = z.infer<typeof auditFormSchema>;
export type ToolInputValues = z.infer<typeof toolInputSchema>;