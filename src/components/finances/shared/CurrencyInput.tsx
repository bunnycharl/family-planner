"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps {
  value: number;
  onChange?: (value: number) => void;
  currency?: string;
  readOnly?: boolean;
  highlighted?: boolean;
  bold?: boolean;
  negative?: boolean;
  placeholder?: string;
  className?: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  RUB: "\u20BD",
  EUR: "\u20AC",
  USD: "$",
};

function formatDisplay(value: number): string {
  if (value === 0) return "";
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(value));
}

export function CurrencyInput({
  value,
  onChange,
  currency = "RUB",
  readOnly = false,
  highlighted = false,
  bold = false,
  negative = false,
  placeholder,
  className,
}: CurrencyInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStart = useCallback(() => {
    if (readOnly) return;
    setEditValue(value === 0 ? "" : String(Math.round(value)));
    setIsEditing(true);
  }, [readOnly, value]);

  const handleConfirm = useCallback(() => {
    setIsEditing(false);
    const parsed = parseFloat(editValue.replace(/\s/g, "").replace(",", "."));
    const newValue = isNaN(parsed) ? 0 : parsed;
    if (newValue !== value) {
      onChange?.(newValue);
    }
  }, [editValue, value, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleConfirm();
      if (e.key === "Escape") setIsEditing(false);
      if (e.key === "Tab") handleConfirm();
    },
    [handleConfirm]
  );

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleConfirm}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full rounded-xl bg-white px-3 py-2 text-right text-sm font-medium outline-none",
          "ring-2 ring-[var(--c-lavender)]",
          className
        )}
      />
    );
  }

  const displayValue = formatDisplay(value);

  return (
    <button
      type="button"
      onClick={handleStart}
      disabled={readOnly}
      className={cn(
        "w-full rounded-xl px-3 py-2 text-right text-sm transition-colors",
        readOnly ? "cursor-default" : "cursor-pointer hover:bg-white/80",
        highlighted ? "bg-[var(--c-yellow)]/15" : "bg-white",
        bold ? "font-extrabold" : "font-medium",
        negative && value !== 0 ? "text-[var(--c-coral)]" : "text-[var(--c-black)]",
        !displayValue && "text-[var(--c-black)]/30",
        className
      )}
    >
      {displayValue
        ? `${negative && value > 0 ? "-" : ""}${displayValue} ${symbol}`
        : (placeholder ?? `0 ${symbol}`)}
    </button>
  );
}
