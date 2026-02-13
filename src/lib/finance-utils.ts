// Tax rules
export const TAX_RULES = {
  nikita: { Инвестиции: 0.13 },
  darya: { Консультации: 0.04, Школа: 0.06 },
} as const;

// Compute Darya's parametric income
export function computeDaryaIncome(params: Record<string, number>) {
  const clients = params["clients"] ?? 0;
  const consultationPrice = params["consultation_price"] ?? 0;
  const schoolLessonsPerWeek = params["school_lessons_per_week"] ?? 0;
  const lessonPrice = params["lesson_price"] ?? 0;
  const workDaysPerWeek = params["work_days_per_week"] ?? 5;
  const weeksPerMonth = params["weeks_per_month"] ?? 4.33;

  const consultationIncome = clients * consultationPrice * workDaysPerWeek * weeksPerMonth;
  const schoolIncome = schoolLessonsPerWeek * lessonPrice * weeksPerMonth;

  return { consultationIncome, schoolIncome };
}

export function computeTax(
  personSlug: "nikita" | "darya",
  category: string,
  amount: number
): number {
  const rules = TAX_RULES[personSlug] as Record<string, number>;
  const rate = rules[category] ?? 0;
  return Math.round(amount * rate);
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(amount);
}

export const MONTH_LABELS = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
] as const;

export const INCOME_CATEGORIES_NIKITA = [
  "Аренда квартиры",
  "Инвестиции",
  "Фриланс / работа / прочее",
] as const;

export const INCOME_CATEGORIES_DARYA = ["Консультации", "Школа"] as const;

export const DARYA_PARAM_KEYS = [
  { key: "clients", label: "Кол-во клиентов" },
  { key: "consultation_price", label: "Цена консультации (₽)" },
  { key: "school_lessons_per_week", label: "Уроков в школе / неделю" },
  { key: "lesson_price", label: "Цена урока в школе (₽)" },
  { key: "work_days_per_week", label: "Рабочих дней / неделю" },
  { key: "weeks_per_month", label: "Недель в месяце" },
] as const;

export const EXPENSE_CATEGORIES_MOSCOW = [
  "Продукты",
  "Рестораны / кафе",
  "Транспорт",
  "Коммунальные",
  "Собака (Бруно)",
  "Подписки / сервисы",
  "Здоровье / аптека",
  "Одежда / быт",
  "Связь / интернет",
  "Развлечения",
  "Прочее",
] as const;

export const EXPENSE_CATEGORIES_ONETIME = [
  "Разведка Европы",
  "Юрист VIP",
  "Переезд (билеты, депозит)",
  "Семья",
] as const;
