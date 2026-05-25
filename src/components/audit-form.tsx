"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2, ChevronDown } from "lucide-react";
import { TOOLS } from "@/lib/pricing-data";
import { auditFormSchema, type AuditFormValues } from "@/lib/form-schema";

const STORAGE_KEY = "credex_audit_form";

const USE_CASES = [
  { value: "coding",   label: "Coding & Engineering" },
  { value: "writing",  label: "Writing & Content" },
  { value: "data",     label: "Data & Analysis" },
  { value: "research", label: "Research" },
  { value: "mixed",    label: "Mixed / General" },
] as const;

const DEFAULT_TOOL_ROW: AuditFormValues["tools"][number] = {
  toolId: "",
  planId: "",
  seats: 1,
  monthlySpend: 0,
};

export default function AuditForm() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      tools: [{ ...DEFAULT_TOOL_ROW }],
      teamSize: 5,
      useCase: "mixed",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({ control, name: "tools" });
  const watchedTools = useWatch({ control, name: "tools" });


  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) reset(JSON.parse(saved) as AuditFormValues);
    } catch {

    } finally {
      setIsReady(true);
    }
  }, [reset]);

 
const handleFormChange = useCallback(() => {
  if (saveTimerRef.current) {
    clearTimeout(saveTimerRef.current);
  }

  saveTimerRef.current = setTimeout(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(form.getValues())
      );
    } catch (error) {
      console.error("Failed to save form state:", error);
    }
  }, 300);
}, [form]);
  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  }, []);


  const handleToolChange = useCallback((index: number, toolId: string) => {
    setValue(`tools.${index}.toolId`, toolId);
    setValue(`tools.${index}.planId`, "");
  }, [setValue]);

  const onSubmit = async (data: AuditFormValues) => {
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(err.message ?? "Audit failed");
      }
      const { auditId } = await res.json() as { auditId: string };
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/audit/${auditId}`);
    } catch (err) {
      console.error("Audit submission failed:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  if (!isReady) return <div className="min-h-[500px]" />;

  return (
    <form
      aria-label="AI spend audit form"
      onSubmit={handleSubmit(onSubmit)}
      onChange={handleFormChange}
      className="space-y-4"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Your AI Tools
          </h2>
          <span className="text-xs text-zinc-500">
            {fields.length} tool{fields.length !== 1 ? "s" : ""}
          </span>
        </div>

        {fields.map((field, index) => {
          const selectedToolId = watchedTools[index]?.toolId;
          const selectedTool = TOOLS.find((t) => t.id === selectedToolId);

          return (
            <fieldset
              key={field.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3"
            >
              <legend className="sr-only">Tool {index + 1}</legend>


              <div className="grid grid-cols-2 gap-3">
                {/* Tool */}
                <div className="space-y-1.5">
                  <label htmlFor={`tool-${index}`} className="text-xs font-medium text-zinc-300">
                    Tool
                  </label>
                  <div className="relative">
                    <select
                      id={`tool-${index}`}
                      {...register(`tools.${index}.toolId`)}
                      onChange={(e) => handleToolChange(index, e.target.value)}
                      aria-invalid={!!errors.tools?.[index]?.toolId}
                      className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    >
                      <option value="">Select tool…</option>
                      {TOOLS.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-zinc-500" />
                  </div>
                  {errors.tools?.[index]?.toolId && (
                    <p role="alert" className="text-xs text-red-400">{errors.tools[index]?.toolId?.message}</p>
                  )}
                </div>

                {/* Plan */}
                <div className="space-y-1.5">
                  <label htmlFor={`plan-${index}`} className="text-xs font-medium text-zinc-300">
                    Plan
                  </label>
                  <div className="relative">
                    <select
                      id={`plan-${index}`}
                      {...register(`tools.${index}.planId`)}
                      disabled={!selectedTool}
                      aria-invalid={!!errors.tools?.[index]?.planId}
                      className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <option value="">Select plan…</option>
                      {selectedTool?.plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}{p.pricePerSeat > 0 ? ` — $${p.pricePerSeat}/seat` : " — Free"}
                        </option>
                      ))}
                    </select>
                    <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-zinc-500" />
                  </div>
                  {errors.tools?.[index]?.planId && (
                    <p role="alert" className="text-xs text-red-400">{errors.tools[index]?.planId?.message}</p>
                  )}
                </div>
              </div>


              <div className="grid grid-cols-[1fr_1fr_44px] gap-3 items-end">
                {/* Seats */}
                <div className="space-y-1.5">
                  <label htmlFor={`seats-${index}`} className="text-xs font-medium text-zinc-300">
                    Seats
                  </label>
                  <input
                    id={`seats-${index}`}
                    type="number"
                    min={1}
                    inputMode="numeric"
                    {...register(`tools.${index}.seats`, { valueAsNumber: true })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                  />
                  {errors.tools?.[index]?.seats && (
                    <p role="alert" className="text-xs text-red-400">{errors.tools[index]?.seats?.message}</p>
                  )}
                </div>

                {/* Monthly Spend */}
                <div className="space-y-1.5">
                  <label htmlFor={`spend-${index}`} className="text-xs font-medium text-zinc-300">
                    $/month
                  </label>
                  <div className="relative">
                    <span aria-hidden className="absolute left-3 top-2.5 text-sm text-zinc-500">$</span>
                    <input
                      id={`spend-${index}`}
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      {...register(`tools.${index}.monthlySpend`, { valueAsNumber: true })}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-7 pr-3 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    />
                  </div>
                  {errors.tools?.[index]?.monthlySpend && (
                    <p role="alert" className="text-xs text-red-400">{errors.tools[index]?.monthlySpend?.message}</p>
                  )}
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  aria-label={`Remove tool ${index + 1}`}
                  className="flex h-[42px] w-[44px] items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-500 transition-colors hover:border-red-500/50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 aria-hidden className="h-4 w-4" />
                </button>
              </div>
            </fieldset>
          );
        })}

        <button
          type="button"
          onClick={() => append({ ...DEFAULT_TOOL_ROW })}
          disabled={fields.length >= 20}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-3 text-sm text-zinc-500 transition-colors hover:border-emerald-600 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus aria-hidden className="h-4 w-4" />
          Add another tool
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="space-y-1.5">
          <label htmlFor="team-size" className="text-sm font-medium text-zinc-200">Team size</label>
          <p className="text-xs text-zinc-500">Total people on your team</p>
          <input
            id="team-size"
            type="number"
            min={1}
            inputMode="numeric"
            {...register("teamSize", { valueAsNumber: true })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
          {errors.teamSize && (
            <p role="alert" className="text-xs text-red-400">{errors.teamSize.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="use-case" className="text-sm font-medium text-zinc-200">Primary use case</label>
          <p className="text-xs text-zinc-500">What does your team mainly use AI for?</p>
          <div className="relative">
            <select
              id="use-case"
              {...register("useCase")}
              className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
            >
              {USE_CASES.map((uc) => (
                <option key={uc.value} value={uc.value}>{uc.label}</option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-zinc-500" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-emerald-500 px-6 py-4 text-base font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <span aria-live="polite" className="flex items-center justify-center gap-2">
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            Running your audit…
          </span>
        ) : (
          "Run my free audit →"
        )}
      </button>

      <p className="text-center text-xs text-zinc-600">
        No account required. Results in under 5 seconds.
      </p>
    </form>
  );
}