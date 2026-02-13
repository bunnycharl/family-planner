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
        members: {
          orderBy: { sortOrder: "asc" },
          include: {
            incomeCategories: {
              orderBy: { sortOrder: "asc" },
              include: {
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

    return NextResponse.json(budgetYear);
  } catch (error) {
    logger.error({ err: error }, "Не удалось загрузить бюджетный год");
    return NextResponse.json({ error: "Не удалось загрузить бюджетный год" }, { status: 500 });
  }
});
