import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createTaxRateSchema } from "@/lib/finances/validations";
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

    const taxRates = await prisma.taxRate.findMany({
      where: { budgetYearId: budgetYear.id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(taxRates);
  } catch (error) {
    logger.error({ err: error }, "Не удалось загрузить налоговые ставки");
    return NextResponse.json({ error: "Не удалось загрузить налоговые ставки" }, { status: 500 });
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
    const result = createTaxRateSchema.safeParse(body);

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

    const maxSortOrder = await prisma.taxRate.aggregate({
      where: { budgetYearId: budgetYear.id },
      _max: { sortOrder: true },
    });

    const sortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const taxRate = await prisma.taxRate.create({
      data: {
        budgetYearId: budgetYear.id,
        name: result.data.name,
        rate: result.data.rate,
        sortOrder,
      },
    });

    return NextResponse.json(taxRate, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать налоговую ставку");
    return NextResponse.json({ error: "Не удалось создать налоговую ставку" }, { status: 500 });
  }
});
