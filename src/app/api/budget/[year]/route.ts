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

  try {
    const budgetYear = await prisma.budgetYear.findUnique({
      where: { year },
      include: {
        incomeCategories: {
          include: {
            user: true,
            entries: true,
            taxRate: true,
            params: {
              orderBy: { sortOrder: "asc" },
              include: {
                values: true,
              },
            },
          },
        },
        taxRates: {
          orderBy: { sortOrder: "asc" },
        },
        expenseGroups: {
          orderBy: { sortOrder: "asc" },
          include: {
            categories: {
              orderBy: { sortOrder: "asc" },
              include: {
                entries: true,
              },
            },
          },
        },
        currencyRates: true,
      },
    });

    if (!budgetYear) {
      return NextResponse.json({ error: "Бюджетный год не найден" }, { status: 404 });
    }

    // Group income categories by user
    const userMap = new Map<
      string,
      { id: string; name: string; incomeCategories: typeof budgetYear.incomeCategories }
    >();

    for (const cat of budgetYear.incomeCategories) {
      const userId = cat.userId;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: cat.user.id,
          name: cat.user.name,
          incomeCategories: [],
        });
      }
      userMap.get(userId)!.incomeCategories.push(cat);
    }

    // Sort users alphabetically, categories alphabetically within each user
    const incomeUsers = [...userMap.values()]
      .sort((a, b) => a.name.localeCompare(b.name, "ru"))
      .map((u) => ({
        ...u,
        incomeCategories: u.incomeCategories.sort((a, b) => a.name.localeCompare(b.name, "ru")),
      }));

    const { incomeCategories: _dropped, ...rest } = budgetYear;
    void _dropped;

    return NextResponse.json({ ...rest, incomeUsers });
  } catch (error) {
    logger.error({ err: error }, "Не удалось загрузить бюджетный год");
    return NextResponse.json({ error: "Не удалось загрузить бюджетный год" }, { status: 500 });
  }
});
