import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { computeTax, MONTH_LABELS } from "@/lib/finance-utils";

interface PersonSummary {
  personId: string;
  personName: string;
  personSlug: string;
  grossIncome: number;
  tax: number;
  netIncome: number;
  categories: Record<string, number>;
}

interface MonthSummary {
  month: number;
  label: string;
  persons: PersonSummary[];
  totalIncome: number;
  totalTax: number;
  totalNetIncome: number;
  expenses: {
    moscow: number;
    spain: number;
    spainRub: number;
    onetime: number;
    total: number;
  };
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
    const [persons, incomeEntries, expenseEntries, exchangeRates] = await Promise.all([
      prisma.financePerson.findMany(),
      prisma.incomeEntry.findMany({ where: { year: yearNum } }),
      prisma.expenseEntry.findMany({ where: { year: yearNum } }),
      prisma.exchangeRate.findMany({ where: { year: yearNum } }),
    ]);

    // Build lookup maps
    const rateMap = new Map(exchangeRates.map((r) => [r.month, r.eurRub]));

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

      // Calculate per-person income
      const personSummaries: PersonSummary[] = [];
      for (const person of persons) {
        const personEntries = monthIncomes.filter((e) => e.personId === person.id);
        const categories: Record<string, number> = {};
        let grossIncome = 0;
        let tax = 0;

        for (const entry of personEntries) {
          categories[entry.category] = entry.amount;
          grossIncome += entry.amount;
          tax += computeTax(person.slug as "nikita" | "darya", entry.category, entry.amount);
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

      // Calculate expenses by group
      let moscowTotal = 0;
      let spainTotal = 0;
      let onetimeTotal = 0;

      for (const expense of monthExpenses) {
        switch (expense.group) {
          case "moscow":
            moscowTotal += expense.amount;
            break;
          case "spain":
            spainTotal += expense.amount;
            break;
          case "onetime":
            onetimeTotal += expense.amount;
            break;
        }
      }

      const spainRub = Math.round(spainTotal * eurRub);
      const totalExpenses = moscowTotal + spainRub + onetimeTotal;
      const netAfterExpenses = totalNetIncome - totalExpenses;
      cumulative += netAfterExpenses;

      months.push({
        month,
        label: MONTH_LABELS[month - 1],
        persons: personSummaries,
        totalIncome,
        totalTax,
        totalNetIncome,
        expenses: {
          moscow: moscowTotal,
          spain: spainTotal,
          spainRub,
          onetime: onetimeTotal,
          total: totalExpenses,
        },
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
      totalExpenses: months.reduce((s, m) => s + m.expenses.total, 0),
      netAfterExpenses: months.reduce((s, m) => s + m.netAfterExpenses, 0),
    };

    return NextResponse.json({
      year: yearNum,
      persons: persons.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
      })),
      months,
      yearlyTotals,
    });
  } catch (error) {
    logger.error({ err: error }, "Не удалось рассчитать финансовую сводку");
    return NextResponse.json({ error: "Не удалось рассчитать финансовую сводку" }, { status: 500 });
  }
});
