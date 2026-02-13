import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  addMonths,
  addQuarters,
  addYears,
  isBefore,
  isAfter,
  format,
  getQuarter,
  isWithinInterval,
  subMonths,
  subQuarters,
  subYears,
} from "date-fns";
import { ru } from "date-fns/locale";

export type ZoomLevel = "month" | "quarter" | "year";

export interface TimeColumn {
  index: number;
  label: string;
  year: number;
  isCurrentPeriod: boolean;
  periodStart: Date;
  periodEnd: Date;
}

export interface YearSpan {
  year: number;
  colStart: number;
  colSpan: number;
}

export interface TimeAxisConfig {
  columns: TimeColumn[];
  yearSpans: YearSpan[];
  totalColumns: number;
  dateToColumn: (date: Date) => number;
}

interface TaskDateRange {
  startDate: string;
  endDate: string;
}

export function computeTimeAxis(tasks: TaskDateRange[], zoom: ZoomLevel): TimeAxisConfig {
  const now = new Date();

  // 1. Find min/max dates from tasks, or default to current year ± 1
  let minDate: Date;
  let maxDate: Date;

  if (tasks.length > 0) {
    const starts = tasks.map((t) => new Date(t.startDate));
    const ends = tasks.map((t) => new Date(t.endDate));
    minDate = new Date(Math.min(...starts.map((d) => d.getTime())));
    maxDate = new Date(Math.max(...ends.map((d) => d.getTime())));
  } else {
    minDate = startOfYear(now);
    maxDate = endOfYear(now);
  }

  // 2. Align to period boundaries and add 1 period of padding
  let alignedMin: Date;
  let alignedMax: Date;

  switch (zoom) {
    case "month":
      alignedMin = startOfMonth(subMonths(minDate, 1));
      alignedMax = endOfMonth(addMonths(maxDate, 1));
      break;
    case "quarter":
      alignedMin = startOfQuarter(subQuarters(minDate, 1));
      alignedMax = endOfQuarter(addQuarters(maxDate, 1));
      break;
    case "year":
      alignedMin = startOfYear(subYears(minDate, 1));
      alignedMax = endOfYear(addYears(maxDate, 1));
      break;
  }

  // 3. Generate columns
  const columns: TimeColumn[] = [];
  let cursor: Date;
  let index = 0;

  switch (zoom) {
    case "month":
      cursor = new Date(alignedMin);
      while (isBefore(cursor, alignedMax) || cursor.getTime() === alignedMax.getTime()) {
        const periodStart = startOfMonth(cursor);
        const periodEnd = endOfMonth(cursor);
        const isCurrentPeriod = isWithinInterval(now, {
          start: periodStart,
          end: periodEnd,
        });
        columns.push({
          index,
          label: format(cursor, "LLL", { locale: ru }),
          year: cursor.getFullYear(),
          isCurrentPeriod,
          periodStart,
          periodEnd,
        });
        index++;
        cursor = addMonths(cursor, 1);
      }
      break;

    case "quarter":
      cursor = new Date(alignedMin);
      while (isBefore(cursor, alignedMax) || cursor.getTime() === alignedMax.getTime()) {
        const periodStart = startOfQuarter(cursor);
        const periodEnd = endOfQuarter(cursor);
        const isCurrentPeriod = isWithinInterval(now, {
          start: periodStart,
          end: periodEnd,
        });
        columns.push({
          index,
          label: `Q${getQuarter(cursor)}`,
          year: cursor.getFullYear(),
          isCurrentPeriod,
          periodStart,
          periodEnd,
        });
        index++;
        cursor = addQuarters(cursor, 1);
      }
      break;

    case "year":
      cursor = new Date(alignedMin);
      while (isBefore(cursor, alignedMax) || cursor.getTime() === alignedMax.getTime()) {
        const periodStart = startOfYear(cursor);
        const periodEnd = endOfYear(cursor);
        const isCurrentPeriod = isWithinInterval(now, {
          start: periodStart,
          end: periodEnd,
        });
        columns.push({
          index,
          label: String(cursor.getFullYear()),
          year: cursor.getFullYear(),
          isCurrentPeriod,
          periodStart,
          periodEnd,
        });
        index++;
        cursor = addYears(cursor, 1);
      }
      break;
  }

  // 4. Compute year spans
  const yearSpans: YearSpan[] = [];
  let currentYear = -1;
  let spanStart = 0;
  let spanCount = 0;

  for (const col of columns) {
    if (col.year !== currentYear) {
      if (currentYear !== -1) {
        yearSpans.push({ year: currentYear, colStart: spanStart, colSpan: spanCount });
      }
      currentYear = col.year;
      spanStart = col.index;
      spanCount = 1;
    } else {
      spanCount++;
    }
  }
  if (currentYear !== -1) {
    yearSpans.push({ year: currentYear, colStart: spanStart, colSpan: spanCount });
  }

  // 5. Build dateToColumn
  const dateToColumn = (date: Date): number => {
    // Find the column whose period contains this date
    for (const col of columns) {
      if (
        isWithinInterval(date, { start: col.periodStart, end: col.periodEnd }) ||
        date.getTime() === col.periodStart.getTime()
      ) {
        return col.index;
      }
    }
    // Clamp to boundaries
    if (columns.length === 0) return 0;
    if (isBefore(date, columns[0].periodStart)) return 0;
    return columns[columns.length - 1].index;
  };

  return {
    columns,
    yearSpans,
    totalColumns: columns.length,
    dateToColumn,
  };
}

/**
 * Compute the column index for the "today" marker.
 * Returns -1 if today is outside the visible range.
 */
export function getTodayColumn(timeAxis: TimeAxisConfig): number {
  const now = new Date();
  if (timeAxis.columns.length === 0) return -1;

  const first = timeAxis.columns[0];
  const last = timeAxis.columns[timeAxis.columns.length - 1];

  if (isBefore(now, first.periodStart) || isAfter(now, last.periodEnd)) {
    return -1;
  }

  return timeAxis.dateToColumn(now);
}
