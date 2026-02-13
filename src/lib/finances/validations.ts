import { z } from "zod";

const monthSchema = z.number().int().min(1).max(12);
const yearSchema = z.number().int().min(2020).max(2100);

// ─── Budget Year ────────────────────────────────────────────

export const createBudgetYearSchema = z.object({
  year: yearSchema,
  baseCurrency: z.string().default("RUB"),
});

// ─── Bulk Entry Upsert (auto-save) ─────────────────────────

export const bulkUpsertEntriesSchema = z.object({
  incomeEntries: z
    .array(
      z.object({
        incomeCategoryId: z.string(),
        month: monthSchema,
        amount: z.number(),
      })
    )
    .optional(),
  formulaParamValues: z
    .array(
      z.object({
        formulaParamId: z.string(),
        month: monthSchema,
        value: z.number(),
      })
    )
    .optional(),
  expenseEntries: z
    .array(
      z.object({
        expenseCategoryId: z.string(),
        month: monthSchema,
        amount: z.number(),
      })
    )
    .optional(),
  currencyRates: z
    .array(
      z.object({
        currency: z.string(),
        month: monthSchema,
        rate: z.number().min(0),
      })
    )
    .optional(),
});

// ─── Copy Month ─────────────────────────────────────────────

export const copyMonthSchema = z.object({
  fromMonth: monthSchema,
  toMonths: z.array(monthSchema).min(1),
});

// ─── Settings CRUD ──────────────────────────────────────────

export const createIncomeCategorySchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(100),
  type: z.enum(["FIXED", "FORMULA"]).default("FIXED"),
  taxRateId: z.string().nullable().optional(),
  formula: z.string().nullable().optional(),
});

export const updateIncomeCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["FIXED", "FORMULA"]).optional(),
  taxRateId: z.string().nullable().optional(),
  formula: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const createFormulaParamSchema = z.object({
  name: z.string().min(1).max(100),
  paramKey: z.string().min(1).max(50),
});

export const createTaxRateSchema = z.object({
  name: z.string().min(1).max(100),
  rate: z.number().min(0).max(1),
});

export const updateTaxRateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  rate: z.number().min(0).max(1).optional(),
  sortOrder: z.number().int().optional(),
});

export const createExpenseGroupSchema = z.object({
  name: z.string().min(1).max(100),
  currency: z.string().default("RUB"),
});

export const updateExpenseGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  currency: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const createExpenseCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateExpenseCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().optional(),
});

// ─── Transaction Categories ─────────────────────────────────

export const createTransactionCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#a78bfa"),
  expenseCategoryId: z.string().nullable().optional(),
});

export const updateTransactionCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  expenseCategoryId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

// ─── Transactions ───────────────────────────────────────────

export const createTransactionSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
  description: z.string().max(500).nullable().optional(),
});

export const updateTransactionSchema = z.object({
  categoryId: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.string().optional(),
  description: z.string().max(500).nullable().optional(),
});

// ─── Currency Rates ─────────────────────────────────────────

export const currencyRateSchema = z.object({
  currency: z.enum(["USD", "EUR"]),
  month: z.number().int().min(1).max(12),
  rate: z.number().min(0),
});

export const upsertCurrencyRatesSchema = z.array(currencyRateSchema);

// ─── Reorder ────────────────────────────────────────────────

export const reorderSchema = z.array(
  z.object({
    id: z.string(),
    sortOrder: z.number().int(),
  })
);
