import { evaluateFormula } from "./formula-engine";
import type {
  BudgetYearData,
  IncomeCategoryData,
  TaxRateData,
  MonthSummary,
  MemberMonthSummary,
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
    const memberSummaries: MemberMonthSummary[] = [];

    for (const member of data.members) {
      const categories: CategoryMonthSummary[] = [];
      let memberGross = 0;
      let memberTax = 0;

      for (const cat of member.incomeCategories) {
        const amount = computeCategoryIncome(cat, month);
        const tax = computeTax(amount, cat.taxRate);
        memberGross += amount;
        memberTax += tax;

        categories.push({
          id: cat.id,
          name: cat.name,
          amount,
          tax,
          isFormula: cat.type === "FORMULA",
        });
      }

      memberSummaries.push({
        memberId: member.id,
        memberName: member.name,
        grossIncome: memberGross,
        tax: memberTax,
        netIncome: memberGross - memberTax,
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

    const totalGrossIncome = memberSummaries.reduce((s, m) => s + m.grossIncome, 0);
    const totalTax = memberSummaries.reduce((s, m) => s + m.tax, 0);
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
      memberSummaries,
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
