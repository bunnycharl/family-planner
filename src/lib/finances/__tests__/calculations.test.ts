import { describe, it, expect } from "vitest";
import {
  computeCategoryIncome,
  computeTax,
  computeYearSummary,
  formatMoney,
} from "../calculations";
import type { IncomeCategoryData, TaxRateData, BudgetYearData } from "../types";

// ─── Helpers ────────────────────────────────────────────────

function makeFixedCategory(overrides?: Partial<IncomeCategoryData>): IncomeCategoryData {
  return {
    id: "cat-1",
    name: "Зарплата",
    type: "FIXED",
    taxRateId: null,
    taxRate: null,
    formula: null,
    sortOrder: 0,
    params: [],
    entries: [],
    ...overrides,
  };
}

function makeFormulaCategory(overrides?: Partial<IncomeCategoryData>): IncomeCategoryData {
  return {
    id: "cat-2",
    name: "Фриланс",
    type: "FORMULA",
    taxRateId: null,
    taxRate: null,
    formula: "clients * price",
    sortOrder: 0,
    params: [
      {
        id: "p1",
        name: "Клиенты",
        paramKey: "clients",
        sortOrder: 0,
        values: [{ id: "v1", formulaParamId: "p1", month: 3, value: 5 }],
      },
      {
        id: "p2",
        name: "Цена",
        paramKey: "price",
        sortOrder: 1,
        values: [{ id: "v2", formulaParamId: "p2", month: 3, value: 10000 }],
      },
    ],
    entries: [],
    ...overrides,
  };
}

// ─── computeCategoryIncome ──────────────────────────────────

describe("computeCategoryIncome", () => {
  it("returns entry amount for FIXED category", () => {
    const cat = makeFixedCategory({
      entries: [{ id: "e1", incomeCategoryId: "cat-1", month: 1, amount: 100000 }],
    });
    expect(computeCategoryIncome(cat, 1)).toBe(100000);
  });

  it("returns 0 for FIXED category with no entry for month", () => {
    const cat = makeFixedCategory({ entries: [] });
    expect(computeCategoryIncome(cat, 1)).toBe(0);
  });

  it("evaluates FORMULA category correctly", () => {
    const cat = makeFormulaCategory();
    // month 3: clients=5, price=10000 => 50000
    expect(computeCategoryIncome(cat, 3)).toBe(50000);
  });

  it("returns 0 for FORMULA category with no formula string", () => {
    const cat = makeFormulaCategory({ formula: null });
    expect(computeCategoryIncome(cat, 3)).toBe(0);
  });

  it("uses 0 for missing param values in a different month", () => {
    const cat = makeFormulaCategory();
    // month 1 has no param values => clients=0, price=0 => 0
    expect(computeCategoryIncome(cat, 1)).toBe(0);
  });
});

// ─── computeTax ─────────────────────────────────────────────

describe("computeTax", () => {
  const taxRate: TaxRateData = {
    id: "tax-1",
    name: "НДФЛ",
    rate: 0.13,
    sortOrder: 0,
  };

  it("applies tax rate to amount", () => {
    // 100000 * 0.13 = 13000
    expect(computeTax(100000, taxRate)).toBe(13000);
  });

  it("returns 0 when taxRate is null", () => {
    expect(computeTax(100000, null)).toBe(0);
  });

  it("returns 0 when amount is zero", () => {
    expect(computeTax(0, taxRate)).toBe(0);
  });

  it("returns 0 when amount is negative", () => {
    expect(computeTax(-5000, taxRate)).toBe(0);
  });

  it("rounds result to integer", () => {
    // 99999 * 0.13 = 12999.87 => Math.round => 13000
    expect(computeTax(99999, taxRate)).toBe(13000);
  });
});

// ─── computeYearSummary ─────────────────────────────────────

describe("computeYearSummary", () => {
  it("aggregates data correctly for a full year fixture", () => {
    const taxRate: TaxRateData = {
      id: "tax-1",
      name: "НДФЛ 13%",
      rate: 0.13,
      sortOrder: 0,
    };

    const data: BudgetYearData = {
      id: "year-1",
      year: 2026,
      baseCurrency: "RUB",
      taxRates: [taxRate],
      currencyRates: [{ id: "cr-1", currency: "EUR", month: 1, rate: 100 }],
      members: [
        {
          id: "m1",
          name: "Алексей",
          sortOrder: 0,
          incomeCategories: [
            makeFixedCategory({
              id: "c1",
              name: "Зарплата",
              taxRate,
              taxRateId: "tax-1",
              entries: [{ id: "e1", incomeCategoryId: "c1", month: 1, amount: 200000 }],
            }),
          ],
        },
      ],
      expenseGroups: [
        {
          id: "g1",
          name: "Аренда",
          currency: "EUR",
          sortOrder: 0,
          categories: [
            {
              id: "ec1",
              name: "Квартира",
              sortOrder: 0,
              entries: [{ id: "ee1", expenseCategoryId: "ec1", month: 1, amount: 800 }],
            },
          ],
        },
      ],
    };

    const summaries = computeYearSummary(data);

    expect(summaries).toHaveLength(12);

    // January (month=1) checks
    const jan = summaries[0];
    expect(jan.month).toBe(1);

    // Gross income: 200000
    expect(jan.totalGrossIncome).toBe(200000);

    // Tax: 200000 * 0.13 = 26000
    expect(jan.totalTax).toBe(26000);

    // Net: 200000 - 26000 = 174000
    expect(jan.totalNetIncome).toBe(174000);

    // Expenses in EUR: 800 * 100 (rate) = 80000 RUB
    expect(jan.totalExpenses).toBe(80000);

    // Balance: 174000 - 80000 = 94000
    expect(jan.balance).toBe(94000);

    // Cumulative after Jan = 94000
    expect(jan.cumulative).toBe(94000);

    // Member summary
    expect(jan.memberSummaries).toHaveLength(1);
    expect(jan.memberSummaries[0].memberName).toBe("Алексей");
    expect(jan.memberSummaries[0].grossIncome).toBe(200000);
    expect(jan.memberSummaries[0].netIncome).toBe(174000);

    // Expense group summary
    expect(jan.expenseGroupSummaries).toHaveLength(1);
    expect(jan.expenseGroupSummaries[0].amount).toBe(800);
    expect(jan.expenseGroupSummaries[0].amountInBaseCurrency).toBe(80000);

    // February (month=2) - no income entries, no expense entries
    const feb = summaries[1];
    expect(feb.totalGrossIncome).toBe(0);
    expect(feb.totalExpenses).toBe(0);
    expect(feb.balance).toBe(0);
    // Cumulative stays at 94000
    expect(feb.cumulative).toBe(94000);
  });
});

// ─── formatMoney ────────────────────────────────────────────

describe("formatMoney", () => {
  it("formats RUB with ruble sign", () => {
    const result = formatMoney(150000, "RUB");
    expect(result).toContain("150");
    expect(result).toContain("\u20BD"); // ₽
  });

  it("formats without currency as RUB by default", () => {
    const result = formatMoney(50000);
    expect(result).toContain("\u20BD");
  });

  it("formats EUR with euro sign", () => {
    const result = formatMoney(1200, "EUR");
    expect(result).toContain("1");
    expect(result).toContain("\u20AC"); // €
  });

  it("formats USD with dollar sign", () => {
    const result = formatMoney(5000, "USD");
    expect(result).toContain("5");
    expect(result).toContain("$");
  });

  it("formats unknown currency with currency code", () => {
    const result = formatMoney(1000, "GBP");
    expect(result).toContain("GBP");
  });

  it("rounds decimal amounts", () => {
    const result = formatMoney(1234.56, "RUB");
    expect(result).toContain("1");
    // Should not contain decimal point after rounding
    expect(result).not.toContain(".");
  });
});
