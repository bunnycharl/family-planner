"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GridCellProps {
  value: number;
  onChange: (value: number) => void;
  readOnly?: boolean;
  highlight?: boolean;
  bold?: boolean;
  negative?: boolean;
  prefix?: string;
  suffix?: string;
}

export function GridCell({
  value,
  onChange,
  readOnly = false,
  highlight = false,
  bold = false,
  negative = false,
  prefix,
  suffix,
}: GridCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const formatted = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.abs(value));

  const displayValue = `${negative && value > 0 ? "-" : ""}${prefix ?? ""}${formatted}${suffix ?? ""}`;

  function handleClick() {
    if (readOnly) return;
    setEditValue(String(value || ""));
    setIsEditing(true);
  }

  function handleBlur() {
    setIsEditing(false);
    const parsed = parseFloat(editValue.replace(/\s/g, "").replace(",", ".")) || 0;
    if (parsed !== value) {
      onChange(parsed);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full min-w-[80px] rounded-lg border-2 border-[var(--c-lavender)] bg-white px-2 py-1 text-right text-xs font-bold text-[var(--c-black)] outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={readOnly}
      className={cn(
        "w-full min-w-[80px] rounded-lg px-2 py-1.5 text-right text-xs transition-all",
        readOnly ? "cursor-default" : "cursor-pointer hover:bg-[var(--c-lavender)]/10",
        highlight && "bg-[var(--c-yellow)]/20",
        bold ? "font-extrabold text-[var(--c-black)]" : "font-medium text-[#666]",
        negative && value > 0 && "text-[var(--c-coral)]"
      )}
    >
      {value === 0 && !bold ? "—" : displayValue}
    </button>
  );
}
