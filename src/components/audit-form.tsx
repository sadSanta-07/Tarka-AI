"use client";

import {
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2, ChevronDown } from "lucide-react";
import { TOOLS } from "@/lib/pricing-data";
import { auditFormSchema, type AuditFormValues } from "@/lib/form-schema";

const STORAGE_KEY = "credex_audit_form";

const USE_CASES = [
  { value: "coding", label: "Coding & Engineering" },
  { value: "writing", label: "Writing & Content" },
  { value: "data", label: "Data & Analysis" },
  { value: "research", label: "Research" },
  { value: "mixed", label: "Mixed / General" },
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
  const watchedTools = useWatch({
    control,
    name: "tools",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as AuditFormValues;

        reset(parsed);
      }
    } catch {
    } finally {
      setIsReady(true);
    }
  }, [reset]);

  const handleFormChange = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        const values = form.getValues();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      } catch {
        // storage full or blocked
      }
    }, 300);
  }, [form]);

  useEffect(() => {

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleToolChange = useCallback(
    (index: number, toolId: string) => {
      setValue(`tools.${index}.toolId`, toolId);
      setValue(`tools.${index}.planId`, "");
    },
    [setValue]
  );

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
  if (!isReady) {
    return (
      <div className="min-h-[700px]" />
    );
  }
  return (
    <form
      aria-label="AI spend audit form"
      onSubmit={handleSubmit(onSubmit)}
      onChange={handleFormChange}
      className="space-y-6"
    >
      {/*  Tool Rows  */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Your AI Tools
          </h2>
          <span className="text-xs text-zinc-400">
            {fields.length} tool{fields.length !== 1 ? "s" : ""}
          </span>
        </div>

        {fields.map((field, index) => {
          const selectedToolId = watchedTools[index]?.toolId;

          const selectedTool = TOOLS.find(
            (t) => t.id === selectedToolId
          );

          return (
            <fieldset
              key={field.id}
              className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-4"
            >
              <legend className="sr-only">
                AI Tool Configuration {index + 1}
              </legend>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_100px_140px_56px]">

                {/* TOOL */}
                <div className="space-y-2">
                  <label
                    htmlFor={`tool-${index}`}
                    className="block text-sm font-medium text-zinc-200"
                  >
                    Tool
                  </label>

                  <div className="relative">
                    <select
                      id={`tool-${index}`}
                      aria-invalid={
                        errors.tools?.[index]?.toolId
                          ? true
                          : undefined
                      }
                      aria-describedby={
                        errors.tools?.[index]?.toolId
                          ? `tool-error-${index}`
                          : undefined
                      }
                      {...register(`tools.${index}.toolId`)}
                      onChange={(e) =>
                        handleToolChange(index, e.target.value)
                      }
                      className="min-h-[48px] w-full appearance-none rounded-xl border border-zinc-600 bg-zinc-800 px-4 pr-10 text-sm text-white transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select tool</option>

                      {TOOLS.map((tool) => (
                        <option
                          key={tool.id}
                          value={tool.id}
                        >
                          {tool.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                    />
                  </div>

                  {errors.tools?.[index]?.toolId && (
                    <p
                      id={`tool-error-${index}`}
                      role="alert"
                      className="text-xs text-red-400"
                    >
                      {errors.tools[index]?.toolId?.message}
                    </p>
                  )}
                </div>

                {/* PLAN */}
                <div className="space-y-2">
                  <label
                    htmlFor={`plan-${index}`}
                    className="block text-sm font-medium text-zinc-200"
                  >
                    Plan
                  </label>

                  <div className="relative">
                    <select
                      id={`plan-${index}`}
                      disabled={!selectedTool}
                      aria-invalid={
                        errors.tools?.[index]?.planId
                          ? true
                          : undefined
                      }
                      {...register(`tools.${index}.planId`)}
                      className="min-h-[48px] w-full appearance-none rounded-xl border border-zinc-600 bg-zinc-800 px-4 pr-10 text-sm text-white transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select plan</option>

                      {selectedTool?.plans.map((plan) => (
                        <option
                          key={plan.id}
                          value={plan.id}
                        >
                          {plan.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                    />
                  </div>
                </div>

                {/* SEATS */}
                <div className="space-y-2">
                  <label
                    htmlFor={`seats-${index}`}
                    className="block text-sm font-medium text-zinc-200"
                  >
                    Seats
                  </label>

                  <input
                    id={`seats-${index}`}
                    type="number"
                    min={1}
                    inputMode="numeric"
                    {...register(`tools.${index}.seats`, {
                      valueAsNumber: true,
                    })}
                    className="min-h-[48px] w-full rounded-xl border border-zinc-600 bg-zinc-800 px-4 text-sm text-white transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* MONTHLY SPEND */}
                <div className="space-y-2">
                  <label
                    htmlFor={`monthly-${index}`}
                    className="block text-sm font-medium text-zinc-200"
                  >
                    Monthly Spend
                  </label>

                  <div className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                    >
                      $
                    </span>

                    <input
                      id={`monthly-${index}`}
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      {...register(
                        `tools.${index}.monthlySpend`,
                        {
                          valueAsNumber: true,
                        }
                      )}
                      className="min-h-[48px] w-full rounded-xl border border-zinc-600 bg-zinc-800 py-2 pl-8 pr-4 text-sm text-white transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* REMOVE */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    aria-label={`Remove tool ${index + 1}`}
                    className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 transition hover:border-red-500 hover:text-red-400 disabled:opacity-40"
                  >
                    <Trash2
                      aria-hidden="true"
                      className="h-4 w-4"
                    />
                  </button>
                </div>
              </div>
            </fieldset>
          );
        })}

        <button
          type="button"
          onClick={() => append({ ...DEFAULT_TOOL_ROW })}
          disabled={fields.length >= 20}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-3 text-sm text-zinc-400 transition-colors hover:border-emerald-600 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus
            aria-hidden="true"
            className="h-4 w-4"
          />
          Add another tool
        </button>
      </div>

      {/* ── Team Context ── */}
      <div className="grid gap-4 md:grid-cols-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="space-y-1">
          <label
            htmlFor="team-size"
            className="text-sm font-medium text-zinc-200"
          >Team size</label>
          <p className="text-xs text-zinc-400">Total people on your team</p>
          <input
            id="team-size"
            type="number"
            min={1}
            {...register("teamSize", { valueAsNumber: true })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors.teamSize && (
            <p className="text-xs text-red-400">{errors.teamSize.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="use-case"
            className="text-sm font-medium text-zinc-200"
          >
            Primary use case
          </label>
          <p className="text-xs text-zinc-400">
            What does your team mainly use AI for?
          </p>
          <div className="relative">
            <select
              id="use-case"
              {...register("useCase")}
              className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
            >
              {USE_CASES.map((uc) => (
                <option key={uc.value} value={uc.value}>
                  {uc.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true" className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-zinc-400" />
          </div>
          {errors.useCase && (
            <p className="text-xs text-red-400">{errors.useCase.message}</p>
          )}
        </div>
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full overflow-hidden rounded-xl bg-emerald-500 px-6 py-4 text-base font-semibold text-zinc-950  hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <span
            aria-live="polite"
            className="flex items-center justify-center gap-2"
          >
            <Loader2
              aria-hidden="true"
              className="h-4 w-4 animate-spin"
            />
            Running your audit…
          </span>
        ) : (
          <span>Run my free audit →</span>
        )}
      </button>

      <p className="text-center text-xs text-zinc-600">
        No account required. Results in under 5 seconds.
      </p>
    </form>
  );
}