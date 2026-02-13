// 2026: monthly Feb-Dec = 11 columns (indices 0-10)
// 2027-2035: quarterly Q1-Q4 = 36 columns (indices 11-46)
// Total: 47 columns

export function dateToColumn(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed

  if (year === 2026) {
    return Math.max(0, Math.min(10, month - 1)); // Feb(1)=0, Dec(11)=10
  }
  if (year >= 2027 && year <= 2035) {
    const quarter = Math.floor(month / 3);
    return 11 + (year - 2027) * 4 + quarter;
  }
  if (year < 2026) return 0;
  return 46;
}

export function getColumnCount(): number {
  return 47;
}

export interface TimeColumn {
  index: number;
  label: string;
  year: number;
  isMonthly: boolean;
  isCurrentPeriod: boolean;
}

export function getTimeColumns(): TimeColumn[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const columns: TimeColumn[] = [];

  // 2026 monthly (Feb-Dec)
  const monthLabels = ["Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
  monthLabels.forEach((label, i) => {
    columns.push({
      index: i,
      label,
      year: 2026,
      isMonthly: true,
      isCurrentPeriod: currentYear === 2026 && currentMonth === i + 1,
    });
  });

  // 2027-2035 quarterly
  for (let y = 2027; y <= 2035; y++) {
    for (let q = 0; q < 4; q++) {
      const colIndex = 11 + (y - 2027) * 4 + q;
      columns.push({
        index: colIndex,
        label: `Q${q + 1}`,
        year: y,
        isMonthly: false,
        isCurrentPeriod: currentYear === y && Math.floor(currentMonth / 3) === q,
      });
    }
  }

  return columns;
}

// Year boundaries for the header
export function getYearSpans(): Array<{
  year: number;
  colStart: number;
  colSpan: number;
}> {
  const spans = [{ year: 2026, colStart: 0, colSpan: 11 }];
  for (let y = 2027; y <= 2035; y++) {
    spans.push({ year: y, colStart: 11 + (y - 2027) * 4, colSpan: 4 });
  }
  return spans;
}

export const ROADMAP_TASK_TYPES: Record<string, { label: string; color: string }> = {
  documents: { label: "Документы / подготовка", color: "#3b82f6" },
  travel: { label: "Путешествия / перелёты", color: "#f59e0b" },
  consultation: { label: "Консультация / юрист", color: "#8b5cf6" },
  visa: { label: "Визы / ВНЖ / ожидание", color: "#6366f1" },
  relocation: { label: "Переезд / обустройство", color: "#ef4444" },
  living: { label: "Жизнь в стране / работа", color: "#10b981" },
  child: { label: "Ребёнок / роды", color: "#ec4899" },
  citizenship: { label: "Гражданство", color: "#f97316" },
};
