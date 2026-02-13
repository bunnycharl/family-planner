"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { validateFormula } from "@/lib/finances/formula-engine";

interface FormulaEditorProps {
  formula: string;
  availableParams: { paramKey: string; name: string }[];
  onChange: (formula: string) => void;
}

export function FormulaEditor({ formula, availableParams, onChange }: FormulaEditorProps) {
  const [localFormula, setLocalFormula] = useState(formula);
  const [validation, setValidation] = useState<{
    valid: boolean;
    error?: string;
  }>({ valid: true });

  useEffect(() => {
    setLocalFormula(formula);
  }, [formula]);

  useEffect(() => {
    if (!localFormula.trim()) {
      setValidation({ valid: true });
      return;
    }
    const keys = availableParams.map((p) => p.paramKey);
    setValidation(validateFormula(localFormula, keys));
  }, [localFormula, availableParams]);

  function handleBlur() {
    if (localFormula !== formula && validation.valid) {
      onChange(localFormula);
    }
  }

  function insertParam(paramKey: string) {
    const newFormula = localFormula ? `${localFormula} * ${paramKey}` : paramKey;
    setLocalFormula(newFormula);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {availableParams.map((p) => (
          <button
            key={p.paramKey}
            type="button"
            onClick={() => insertParam(p.paramKey)}
            className="rounded-full bg-[var(--c-lavender)]/15 px-2.5 py-1 text-[10px] font-bold text-[var(--c-lavender)] hover:bg-[var(--c-lavender)]/25 transition-colors cursor-pointer"
          >
            {p.paramKey}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={localFormula}
        onChange={(e) => setLocalFormula(e.target.value)}
        onBlur={handleBlur}
        placeholder="Формула: clients * price"
        className={cn(
          "w-full rounded-xl border-2 bg-white px-3 py-2 text-sm font-mono outline-none transition-colors",
          validation.valid
            ? "border-[var(--c-black)]/10 focus:border-[var(--c-lavender)]"
            : "border-[var(--c-error)]/50 focus:border-[var(--c-error)]"
        )}
      />

      {!validation.valid && validation.error && (
        <p className="text-[11px] font-medium text-[var(--c-error)]">{validation.error}</p>
      )}
    </div>
  );
}
