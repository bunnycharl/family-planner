import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { computeTaxDynamic, MONTH_LABELS } from "@/lib/finance-utils";

interface PersonSummary {
  personId: string;
  personName: string;
  personSlug: string;
  grossIncome: number;
  tax: number;
  netIncome: number;
  categories: Record<string, number>;
}

interface ExpenseGroupSummary {
  slug: string;
  name: string;
  currency: string;
  amount: number;
  amountRub: number;
}

interface MonthSummary {
  month: number;
  label: string;
  persons: PersonSummary[];
  totalIncome: number;
  totalTax: number;
  totalNetIncome: number;
  expenseGroups: ExpenseGroupSummary[];
  totalExpenses: number;
  eurRub: number;
  netAfterExpenses: number;
  cumulative: number;
}

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  if (!year) {
    return NextResponse.json({ error: "Параметр year обязателен" }, { status: 400 });
  }

  const yearNum = parseInt(year, 10);

  try {
    const [persons, incomeEntries, expenseEntries, exchangeRates, taxRules, expenseGroupsDb] =
      await Promise.all([
        prisma.financePerson.findMany(),
        prisma.incomeEntry.findMany({ where: { year: yearNum } }),
        prisma.expenseEntry.findMany({ where: { year: yearNum } }),
        prisma.exchangeRate.findMany({ where: { year: yearNum } }),
        prisma.financeTaxRule.findMany(),
        prisma.expenseGroup.findMany({ orderBy: { position: "asc" } }),
      ]);

    // Build lookup maps
    const rateMap = new Map(exchangeRates.map((r) => [r.month, r.eurRub]));

    // Tax rules per person
    const taxRulesByPerson = new Map<string, { category: string; rate: number }[]>();
    for (const rule of taxRules) {
      const existing = taxRulesByPerson.get(rule.personId) ?? [];
      existing.push({ category: rule.category, rate: rule.rate });
      taxRulesByPerson.set(rule.personId, existing);
    }

    // Group income entries by month
    const incomeByMonth = new Map<number, typeof incomeEntries>();
    for (const entry of incomeEntries) {
      const existing = incomeByMonth.get(entry.month) ?? [];
      existing.push(entry);
      incomeByMonth.set(entry.month, existing);
    }

    // Group expense entries by month
    const expensesByMonth = new Map<number, typeof expenseEntries>();
    for (const entry of expenseEntries) {
      const existing = expensesByMonth.get(entry.month) ?? [];
      existing.push(entry);
      expensesByMonth.set(entry.month, existing);
    }

    let cumulative = 0;
    const months: MonthSummary[] = [];

    for (let month = 1; month <= 12; month++) {
      const monthIncomes = incomeByMonth.get(month) ?? [];
      const monthExpenses = expensesByMonth.get(month) ?? [];
      const eurRub = rateMap.get(month) ?? 0;

      // Calculate per-person income using dynamic tax rules
      const personSummaries: PersonSummary[] = [];
      for (const person of persons) {
        const personEntries = monthIncomes.filter((e) => e.personId === person.id);
        const personTaxRules = taxRulesByPerson.get(person.id) ?? [];
        const categories: Record<string, number> = {};
        let grossIncome = 0;
        let tax = 0;

        for (const entry of personEntries) {
          categories[entry.category] = entry.amount;
          grossIncome += entry.amount;
          tax += computeTaxDynamic(personTaxRules, entry.category, entry.amount);
        }

        personSummaries.push({
          personId: person.id,
          personName: person.name,
          personSlug: person.slug,
          grossIncome,
          tax,
          netIncome: grossIncome - tax,
          categories,
        });
      }

      const totalIncome = personSummaries.reduce((sum, p) => sum + p.grossIncome, 0);
      const totalTax = personSummaries.reduce((sum, p) => sum + p.tax, 0);
      const totalNetIncome = totalIncome - totalTax;

      // Calculate expenses per group (dynamic from DB)
      const expenseGroups: ExpenseGroupSummary[] = [];
      let totalExpenses = 0;

      for (const group of expenseGroupsDb) {
        const groupExpenses = monthExpenses.filter((e) => e.group === group.slug);
        const amount = groupExpenses.reduce((sum, e) => sum + e.amount, 0);
        const amountRub = group.currency === "EUR" ? Math.round(amount * eurRub) : amount;

        expenseGroups.push({
          slug: group.slug,
          name: group.name,
          currency: group.currency,
          amount,
          amountRub,
        });

        totalExpenses += amountRub;
      }

      const netAfterExpenses = totalNetIncome - totalExpenses;
      cumulative += netAfterExpenses;

      months.push({
        month,
        label: MONTH_LABELS[month - 1],
        persons: personSummaries,
        totalIncome,
        totalTax,
        totalNetIncome,
        expenseGroups,
        totalExpenses,
        eurRub,
        netAfterExpenses,
        cumulative,
      });
    }

    // Yearly totals
    const yearlyTotals = {
      totalIncome: months.reduce((s, m) => s + m.totalIncome, 0),
      totalTax: months.reduce((s, m) => s + m.totalTax, 0),
      totalNetIncome: months.reduce((s, m) => s + m.totalNetIncome, 0),
      totalExpenses: months.reduce((s, m) => s + m.totalExpenses, 0),
      netAfterExpenses: months.reduce((s, m) => s + m.netAfterExpenses, 0),
    };

    return NextResponse.json({
      year: yearNum,
      persons: persons.map((p) => ({
        personId: p.id,
        personName: p.name,
        personSlug: p.slug,
      })),
      expenseGroups: expenseGroupsDb.map((g) => ({
        slug: g.slug,
        name: g.name,
        currency: g.currency,
      })),
      months,
      yearlyTotals,
    });
  } catch (error) {
    logger.error({ err: error }, "Не удалось рассчитать финансовую сводку");
    return NextResponse.json({ error: "Не удалось рассчитать финансовую сводку" }, { status: 500 });
  }
});
