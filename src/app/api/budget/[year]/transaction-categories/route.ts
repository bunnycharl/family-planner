import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createTransactionCategorySchema } from "@/lib/finances/validations";
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
      where: { year_familyId: { year, familyId: session.user.familyId } },
    });

    if (!budgetYear) {
      return NextResponse.json({ error: "Бюджетный год не найден" }, { status: 404 });
    }

    const categories = await prisma.transactionCategory.findMany({
      where: { budgetYearId: budgetYear.id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    logger.error({ err: error }, "Не удалось загрузить категории транзакций");
    return NextResponse.json(
      { error: "Не удалось загрузить категории транзакций" },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request, session, context) => {
  const { year: yearStr } = await context!.params;
  const year = parseInt(yearStr, 10);

  if (isNaN(year)) {
    return NextResponse.json({ error: "Некорректный год" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = createTransactionCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const budgetYear = await prisma.budgetYear.findUnique({
      where: { year_familyId: { year, familyId: session.user.familyId } },
    });

    if (!budgetYear) {
      return NextResponse.json({ error: "Бюджетный год не найден" }, { status: 404 });
    }

    const maxSortOrder = await prisma.transactionCategory.aggregate({
      where: { budgetYearId: budgetYear.id },
      _max: { sortOrder: true },
    });

    const sortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const category = await prisma.transactionCategory.create({
      data: {
        budgetYearId: budgetYear.id,
        name: result.data.name,
        color: result.data.color,
        expenseCategoryId: result.data.expenseCategoryId ?? null,
        sortOrder,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать категорию транзакций");
    return NextResponse.json({ error: "Не удалось создать категорию транзакций" }, { status: 500 });
  }
});
