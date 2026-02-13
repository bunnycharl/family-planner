import { format } from "date-fns";
import { ru } from "date-fns/locale";

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

/**
 * Compute a fixed 12-month time axis for a given year.
 */
export function computeTimeAxis(year: number): TimeAxisConfig {
  const now = new Date();
  const columns: TimeColumn[] = [];

  for (let month = 0; month < 12; month++) {
    const periodStart = new Date(year, month, 1);
    const periodEnd = new Date(year, month + 1, 0, 23, 59, 59);
    const isCurrentPeriod = now >= periodStart && now <= periodEnd;

    columns.push({
      index: month,
      label: format(periodStart, "LLL", { locale: ru }),
      year,
      isCurrentPeriod,
      periodStart,
      periodEnd,
    });
  }

  const yearSpans: YearSpan[] = [{ year, colStart: 0, colSpan: 12 }];

  const dateToColumn = (date: Date): number => {
    if (date.getFullYear() < year) return 0;
    if (date.getFullYear() > year) return 11;
    return date.getMonth();
  };

  return {
    columns,
    yearSpans,
    totalColumns: 12,
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

  if (now < first.periodStart || now > last.periodEnd) {
    return -1;
  }

  return timeAxis.dateToColumn(now);
}

interface BarTask {
  id: string;
  startDate: string;
  endDate: string;
}

/**
 * Anti-overlap algorithm: assign each task to a track (row) so bars don't overlap.
 * Returns a Map from taskId to trackIndex (0-based).
 */
export function computeBarTracks(tasks: BarTask[]): Map<string, number> {
  const sorted = [...tasks].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const tracks: { endDate: Date }[] = [];
  const result = new Map<string, number>();

  for (const task of sorted) {
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);

    // Find first track where the previous task has ended before this one starts
    let trackIndex = tracks.findIndex((t) => t.endDate < start);

    if (trackIndex === -1) {
      trackIndex = tracks.length;
      tracks.push({ endDate: end });
    } else {
      tracks[trackIndex].endDate = end;
    }

    result.set(task.id, trackIndex);
  }

  return result;
}
