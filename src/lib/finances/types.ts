// ─── Domain types (mirror Prisma models for frontend use) ───

export type IncomeCategoryType = "FIXED" | "FORMULA";

export interface BudgetYearData {
  id: string;
  year: number;
  baseCurrency: string;
  members: FamilyMemberData[];
  taxRates: TaxRateData[];
  expenseGroups: ExpenseGroupData[];
  currencyRates: CurrencyRateData[];
}

export interface FamilyMemberData {
  id: string;
  name: string;
  sortOrder: number;
  incomeCategories: IncomeCategoryData[];
}

export interface IncomeCategoryData {
  id: string;
  name: string;
  type: IncomeCategoryType;
  taxRateId: string | null;
  taxRate: TaxRateData | null;
  formula: string | null;
  sortOrder: number;
  params: FormulaParamData[];
  entries: IncomeEntryData[];
}

export interface FormulaParamData {
  id: string;
  name: string;
  paramKey: string;
  sortOrder: number;
  values: FormulaParamValueData[];
}

export interface FormulaParamValueData {
  id: string;
  formulaParamId: string;
  month: number;
  value: number;
}

export interface IncomeEntryData {
  id: string;
  incomeCategoryId: string;
  month: number;
  amount: number;
}

export interface TaxRateData {
  id: string;
  name: string;
  rate: number;
  sortOrder: number;
}

export interface ExpenseGroupData {
  id: string;
  name: string;
  currency: string;
  sortOrder: number;
  categories: ExpenseCategoryData[];
}

export interface ExpenseCategoryData {
  id: string;
  name: string;
  sortOrder: number;
  entries: ExpenseEntryData[];
}

export interface ExpenseEntryData {
  id: string;
  expenseCategoryId: string;
  month: number;
  amount: number;
}

export interface CurrencyRateData {
  id: string;
  currency: string;
  month: number;
  rate: number;
}

// ─── Bulk upsert input (for auto-save) ─────────────────────

export interface BulkUpsertInput {
  incomeEntries?: { incomeCategoryId: string; month: number; amount: number }[];
  formulaParamValues?: { formulaParamId: string; month: number; value: number }[];
  expenseEntries?: { expenseCategoryId: string; month: number; amount: number }[];
  currencyRates?: { currency: string; month: number; rate: number }[];
}

// ─── Computed types (for UI) ────────────────────────────────

export interface MonthSummary {
  month: number;
  totalGrossIncome: number;
  totalTax: number;
  totalNetIncome: number;
  totalExpenses: number;
  balance: number;
  cumulative: number;
  memberSummaries: MemberMonthSummary[];
  expenseGroupSummaries: ExpenseGroupMonthSummary[];
}

export interface MemberMonthSummary {
  memberId: string;
  memberName: string;
  grossIncome: number;
  tax: number;
  netIncome: number;
  categories: CategoryMonthSummary[];
}

export interface CategoryMonthSummary {
  id: string;
  name: string;
  amount: number;
  tax: number;
  isFormula: boolean;
}

export interface ExpenseGroupMonthSummary {
  groupId: string;
  groupName: string;
  currency: string;
  amount: number;
  amountInBaseCurrency: number;
  categories: { id: string; name: string; amount: number }[];
}
