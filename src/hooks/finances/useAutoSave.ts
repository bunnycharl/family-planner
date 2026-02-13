import { useCallback, useRef, useState } from "react";
import type { BulkUpsertInput } from "@/lib/finances/types";

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

function mergeEntries<T extends Record<string, unknown>>(
  existing: T[],
  incoming: T[],
  keyFields: string[]
): T[] {
  const result = [...existing];
  for (const entry of incoming) {
    const idx = result.findIndex((e) => keyFields.every((k) => e[k] === entry[k]));
    if (idx >= 0) {
      result[idx] = entry;
    } else {
      result.push(entry);
    }
  }
  return result;
}

function mergeBulkInputs(
  target: BulkUpsertInput,
  source: Partial<BulkUpsertInput>
): BulkUpsertInput {
  return {
    incomeEntries: mergeEntries(target.incomeEntries ?? [], source.incomeEntries ?? [], [
      "incomeCategoryId",
      "month",
    ]),
    formulaParamValues: mergeEntries(
      target.formulaParamValues ?? [],
      source.formulaParamValues ?? [],
      ["formulaParamId", "month"]
    ),
    expenseEntries: mergeEntries(target.expenseEntries ?? [], source.expenseEntries ?? [], [
      "expenseCategoryId",
      "month",
    ]),
    currencyRates: mergeEntries(target.currencyRates ?? [], source.currencyRates ?? [], [
      "currency",
      "month",
    ]),
  };
}

export function useAutoSave(saveFn: (data: BulkUpsertInput) => Promise<void>, debounceMs = 800) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");

  const pendingRef = useRef<BulkUpsertInput>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queueSave = useCallback(
    (entry: Partial<BulkUpsertInput>) => {
      // Merge incoming changes into the pending batch
      pendingRef.current = mergeBulkInputs(pendingRef.current, entry);

      // Reset debounce timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Clear any "saved" -> "idle" timer so status stays relevant
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
        savedTimerRef.current = null;
      }

      timerRef.current = setTimeout(async () => {
        const data = pendingRef.current;
        pendingRef.current = {};

        setStatus("saving");
        try {
          await saveFn(data);
          setStatus("saved");

          // Auto-reset to idle after 2 seconds
          savedTimerRef.current = setTimeout(() => {
            setStatus("idle");
          }, 2000);
        } catch {
          setStatus("error");
        }
      }, debounceMs);
    },
    [saveFn, debounceMs]
  );

  return { queueSave, status };
}
