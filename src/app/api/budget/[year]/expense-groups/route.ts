import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createExpenseGroupSchema } from "@/lib/finances/validations";
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
    });

    if (!budgetYear) {
      return NextResponse.json({ error: "Бюджетный год не найден" }, { status: 404 });
    }

    const groups = await prisma.budgetExpenseGroup.findMany({
      where: { budgetYearId: budgetYear.id },
      orderBy: { sortOrder: "asc" },
      include: {
        categories: {
          orderBy: { sortOrder: "asc" },
          include: { entries: true },
        },
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    logger.error({ err: error }, "Не удалось загрузить группы расходов");
    return NextResponse.json({ error: "Не удалось загрузить группы расходов" }, { status: 500 });
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
    const result = createExpenseGroupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const budgetYear = await prisma.budgetYear.findUnique({
      where: { year },
    });

    if (!budgetYear) {
      return NextResponse.json({ error: "Бюджетный год не найден" }, { status: 404 });
    }

    const maxSortOrder = await prisma.budgetExpenseGroup.aggregate({
      where: { budgetYearId: budgetYear.id },
      _max: { sortOrder: true },
    });

    const sortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const group = await prisma.budgetExpenseGroup.create({
      data: {
        budgetYearId: budgetYear.id,
        name: result.data.name,
        currency: result.data.currency,
        sortOrder,
      },
      include: {
        categories: {
          orderBy: { sortOrder: "asc" },
          include: { entries: true },
        },
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать группу расходов");
    return NextResponse.json({ error: "Не удалось создать группу расходов" }, { status: 500 });
  }
});
