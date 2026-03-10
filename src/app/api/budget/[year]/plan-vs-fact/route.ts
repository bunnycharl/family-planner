import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async (request, session, context) => {
  const { year: yearStr } = await context!.params;
  const year = parseInt(yearStr, 10);

  if (isNaN(year)) {
    return NextResponse.json({ error: "Некорректный год" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const monthStr = searchParams.get("month");

  if (!monthStr) {
    return NextResponse.json({ error: "Параметр month обязателен" }, { status: 400 });
  }

  const month = parseInt(monthStr, 10);
  if (isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Некорректный месяц" }, { status: 400 });
  }

  try {
    const budgetYear = await prisma.budgetYear.findUnique({
      where: { year_familyId: { year, familyId: session.user.familyId } },
    });

    if (!budgetYear) {
      return NextResponse.json({ error: "Бюджетный год не найден" }, { status: 404 });
    }

    // Get all transaction categories that have a mapping to budget expense categories
    const mappedCategories = await prisma.transactionCategory.findMany({
      where: {
        budgetYearId: budgetYear.id,
        expenseCategoryId: { not: null },
      },
      include: {
        expenseCategory: {
          include: {
            expenseGroup: true,
            entries: {
              where: { month },
            },
          },
        },
      },
    });

    // Get actual spending for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);

    const items = await Promise.all(
      mappedCategories.map(async (tc) => {
        if (!tc.expenseCategory) return null;

        const plannedEntry = tc.expenseCategory.entries[0];
        const plannedAmount = plannedEntry?.amount ?? 0;

        // Sum all transactions for this transaction category in this month
        const transactionSum = await prisma.transaction.aggregate({
          where: {
            categoryId: tc.id,
            date: {
              gte: startOfMonth,
              lt: startOfNextMonth,
            },
          },
          _sum: { amount: true },
        });

        const actualAmount = transactionSum._sum.amount ?? 0;
        const difference = plannedAmount - actualAmount;
        const percentUsed =
          plannedAmount > 0 ? Math.round((actualAmount / plannedAmount) * 100) : 0;

        return {
          budgetCategoryId: tc.expenseCategory.id,
          budgetCategoryName: tc.expenseCategory.name,
          budgetGroupName: tc.expenseCategory.expenseGroup.name,
          plannedAmount,
          actualAmount,
          difference,
          percentUsed,
        };
      })
    );

    return NextResponse.json(items.filter(Boolean));
  } catch (error) {
    logger.error({ err: error }, "Не удалось загрузить данные план-vs-факт");
    return NextResponse.json(
      { error: "Не удалось загрузить данные план-vs-факт" },
      { status: 500 }
    );
  }
});
