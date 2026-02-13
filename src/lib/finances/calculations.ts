import { evaluateFormula } from "./formula-engine";
import type {
  BudgetYearData,
  IncomeCategoryData,
  TaxRateData,
  MonthSummary,
  UserMonthSummary,
  CategoryMonthSummary,
  ExpenseGroupMonthSummary,
} from "./types";

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

/**
 * Получить сумму дохода категории за месяц.
 * FIXED → из IncomeEntry.amount
 * FORMULA → вычисление формулы с подставленными значениями параметров
 */
export function computeCategoryIncome(category: IncomeCategoryData, month: number): number {
  if (category.type === "FIXED") {
    const entry = category.entries.find((e) => e.month === month);
    return entry?.amount ?? 0;
  }

  // FORMULA
  if (!category.formula) return 0;

  const params: Record<string, number> = {};
  for (const param of category.params) {
    const val = param.values.find((v) => v.month === month);
    params[param.paramKey] = val?.value ?? 0;
  }

  return evaluateFormula(category.formula, params);
}

/**
 * Вычислить налог.
 */
export function computeTax(amount: number, taxRate: TaxRateData | null): number {
  if (!taxRate || amount <= 0) return 0;
  return Math.round(amount * taxRate.rate);
}

/**
 * Получить курс валюты за месяц.
 */
export function getCurrencyRate(data: BudgetYearData, currency: string, month: number): number {
  if (currency === data.baseCurrency) return 1;
  const rate = data.currencyRates.find((r) => r.currency === currency && r.month === month);
  return rate?.rate ?? 0;
}

/**
 * Конвертация суммы в базовую валюту.
 */
export function convertToBaseCurrency(amount: number, rate: number): number {
  return Math.round(amount * rate);
}

/**
 * Вычислить полную сводку за год.
 */
export function computeYearSummary(data: BudgetYearData): MonthSummary[] {
  const summaries: MonthSummary[] = [];
  let cumulative = 0;

  for (let month = 1; month <= 12; month++) {
    const userSummaries: UserMonthSummary[] = [];

    for (const user of data.incomeUsers) {
      const categories: CategoryMonthSummary[] = [];
      let userGross = 0;
      let userTax = 0;

      for (const cat of user.incomeCategories) {
        const amount = computeCategoryIncome(cat, month);
        const tax = computeTax(amount, cat.taxRate);
        userGross += amount;
        userTax += tax;

        categories.push({
          id: cat.id,
          name: cat.name,
          amount,
          tax,
          isFormula: cat.type === "FORMULA",
        });
      }

      userSummaries.push({
        userId: user.id,
        userName: user.name,
        grossIncome: userGross,
        tax: userTax,
        netIncome: userGross - userTax,
        categories,
      });
    }

    const expenseGroupSummaries: ExpenseGroupMonthSummary[] = [];

    for (const group of data.expenseGroups) {
      const rate = getCurrencyRate(data, group.currency, month);
      let groupAmount = 0;
      const cats: { id: string; name: string; amount: number }[] = [];

      for (const cat of group.categories) {
        const entry = cat.entries.find((e) => e.month === month);
        const amount = entry?.amount ?? 0;
        groupAmount += amount;
        cats.push({ id: cat.id, name: cat.name, amount });
      }

      expenseGroupSummaries.push({
        groupId: group.id,
        groupName: group.name,
        currency: group.currency,
        amount: groupAmount,
        amountInBaseCurrency: convertToBaseCurrency(groupAmount, rate),
        categories: cats,
      });
    }

    const totalGrossIncome = userSummaries.reduce((s, u) => s + u.grossIncome, 0);
    const totalTax = userSummaries.reduce((s, u) => s + u.tax, 0);
    const totalNetIncome = totalGrossIncome - totalTax;
    const totalExpenses = expenseGroupSummaries.reduce((s, g) => s + g.amountInBaseCurrency, 0);
    const balance = totalNetIncome - totalExpenses;
    cumulative += balance;

    summaries.push({
      month,
      totalGrossIncome,
      totalTax,
      totalNetIncome,
      totalExpenses,
      balance,
      cumulative,
      userSummaries,
      expenseGroupSummaries,
    });
  }

  return summaries;
}

/**
 * Форматировать число как денежную сумму.
 */
export function formatMoney(amount: number, currency?: string): string {
  const formatted = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  if (!currency || currency === "RUB") return `${formatted} \u20BD`;
  if (currency === "EUR") return `${formatted} \u20AC`;
  if (currency === "USD") return `${formatted} $`;
  return `${formatted} ${currency}`;
}

// ─── Insight-функции (data storytelling) ─────────────────────

/**
 * Инсайт для графика доходов vs расходов.
 * Сравнивает расходы выбранного месяца с предыдущим.
 */
export function insightIncomeExpense(summaries: MonthSummary[], selectedMonth: number): string {
  const curr = summaries[selectedMonth - 1];
  if (!curr) return "Доходы vs Расходы";

  if (selectedMonth > 1) {
    const prev = summaries[selectedMonth - 2];
    if (prev && prev.totalExpenses > 0) {
      const pctChange = Math.round(
        ((curr.totalExpenses - prev.totalExpenses) / Math.abs(prev.totalExpenses)) * 100
      );
      if (pctChange > 0) return `Расходы выросли на ${pctChange}% к прошлому месяцу`;
      if (pctChange < 0) return `Расходы снизились на ${Math.abs(pctChange)}% к прошлому месяцу`;
      return "Расходы на уровне прошлого месяца";
    }
  }

  const nonZero = summaries.filter((s) => s.totalExpenses > 0);
  if (nonZero.length > 0) {
    const min = nonZero.reduce((a, b) => (a.totalExpenses < b.totalExpenses ? a : b));
    return `Самый экономный месяц — ${MONTH_LABELS[min.month - 1]}`;
  }

  return "Доходы vs Расходы";
}

/**
 * Инсайт для кумулятивного графика.
 */
export function insightCumulative(
  summaries: MonthSummary[],
  selectedMonth: number,
  baseCurrency?: string
): string {
  const curr = summaries[selectedMonth - 1];
  if (!curr) return "Накопительный остаток";

  if (curr.cumulative > 0) {
    const positiveMonths = summaries.slice(0, selectedMonth).filter((s) => s.balance > 0).length;
    return `Накоплено ${formatMoney(curr.cumulative, baseCurrency)} за ${positiveMonths} мес.`;
  }

  if (curr.cumulative < 0) {
    return `Дефицит: ${formatMoney(Math.abs(curr.cumulative), baseCurrency)} с начала года`;
  }

  return "Накопительный остаток";
}

/**
 * Инсайт для доната расходов — доминирующая группа.
 */
export function insightDonut(summary: MonthSummary | null, baseCurrency?: string): string {
  if (!summary) return "Структура расходов";

  const groups = summary.expenseGroupSummaries.filter((g) => g.amountInBaseCurrency > 0);
  if (groups.length === 0) return "Нет расходов за месяц";

  const total = groups.reduce((s, g) => s + g.amountInBaseCurrency, 0);
  const top = groups.reduce((a, b) => (a.amountInBaseCurrency > b.amountInBaseCurrency ? a : b));
  const pct = Math.round((top.amountInBaseCurrency / total) * 100);

  void baseCurrency; // used only in signature for consistency
  return `${top.groupName} — ${pct}% всех расходов`;
}

/**
 * Процент расходов от чистого дохода.
 */
export function expenseToIncomeRatio(summary: MonthSummary | null): number | null {
  if (!summary || summary.totalNetIncome <= 0) return null;
  return Math.round((summary.totalExpenses / summary.totalNetIncome) * 100);
}
