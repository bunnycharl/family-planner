"use client";

import { cn } from "@/lib/utils";
import { MONTH_LABELS } from "@/lib/finance-utils";
import { GridCell } from "./GridCell";

export interface GridRow {
  label: string;
  values: number[];
  readOnly?: boolean;
  highlight?: boolean;
  bold?: boolean;
  negative?: boolean;
  prefix?: string;
  suffix?: string;
}

interface SpreadsheetGridProps {
  rows: GridRow[];
  onCellChange?: (rowIndex: number, monthIndex: number, value: number) => void;
  showTotal?: boolean;
}

export function SpreadsheetGrid({ rows, onCellChange, showTotal = true }: SpreadsheetGridProps) {
  return (
    <div className="overflow-x-auto rounded-3xl bg-[var(--c-gray)] p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-[var(--c-gray)] px-3 py-2 text-left text-[10px] font-bold uppercase text-[#999] min-w-[160px]">
              Статья
            </th>
            {MONTH_LABELS.map((label) => (
              <th
                key={label}
                className="px-1 py-2 text-center text-[10px] font-bold uppercase text-[#999] min-w-[80px]"
              >
                {label}
              </th>
            ))}
            {showTotal && (
              <th className="px-1 py-2 text-center text-[10px] font-bold uppercase text-[var(--c-black)] min-w-[90px]">
                Итого
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => {
            const total = row.values.reduce((sum, v) => sum + v, 0);
            return (
              <tr
                key={row.label}
                className={cn(
                  row.bold && "border-t-2 border-[var(--c-black)]/10",
                  row.highlight && "bg-[var(--c-yellow)]/10 rounded-xl"
                )}
              >
                <td className="sticky left-0 z-10 bg-[var(--c-gray)] px-3 py-1">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                      row.bold
                        ? "bg-[var(--c-black)] text-white"
                        : row.highlight
                          ? "bg-[var(--c-yellow)] text-[var(--c-black)]"
                          : "text-[var(--c-black)]"
                    )}
                  >
                    {row.label}
                  </span>
                </td>
                {row.values.map((val, monthIdx) => (
                  <td key={monthIdx} className="px-0.5 py-0.5">
                    <GridCell
                      value={val}
                      onChange={(v) => onCellChange?.(rowIdx, monthIdx, v)}
                      readOnly={row.readOnly}
                      highlight={row.highlight}
                      bold={row.bold}
                      negative={row.negative}
                      prefix={row.prefix}
                      suffix={row.suffix}
                    />
                  </td>
                ))}
                {showTotal && (
                  <td className="px-0.5 py-0.5">
                    <GridCell
                      value={total}
                      onChange={() => {}}
                      readOnly
                      bold
                      negative={row.negative}
                      prefix={row.prefix}
                      suffix={row.suffix}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
