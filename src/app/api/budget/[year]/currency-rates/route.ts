import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { upsertCurrencyRatesSchema } from "@/lib/finances/validations";
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

    const rates = await prisma.currencyRate.findMany({
      where: { budgetYearId: budgetYear.id },
      orderBy: [{ currency: "asc" }, { month: "asc" }],
    });

    return NextResponse.json(rates);
  } catch (error) {
    logger.error({ err: error }, "Не удалось загрузить курсы валют");
    return NextResponse.json({ error: "Не удалось загрузить курсы валют" }, { status: 500 });
  }
});

export const PUT = withAuth(async (request, session, context) => {
  const { year: yearStr } = await context!.params;
  const year = parseInt(yearStr, 10);

  if (isNaN(year)) {
    return NextResponse.json({ error: "Некорректный год" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = upsertCurrencyRatesSchema.safeParse(body);

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

    const operations = result.data.map((cr) =>
      prisma.currencyRate.upsert({
        where: {
          budgetYearId_currency_month: {
            budgetYearId: budgetYear.id,
            currency: cr.currency,
            month: cr.month,
          },
        },
        update: { rate: cr.rate },
        create: {
          budgetYearId: budgetYear.id,
          currency: cr.currency,
          month: cr.month,
          rate: cr.rate,
        },
      })
    );

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }

    const rates = await prisma.currencyRate.findMany({
      where: { budgetYearId: budgetYear.id },
      orderBy: [{ currency: "asc" }, { month: "asc" }],
    });

    return NextResponse.json(rates);
  } catch (error) {
    logger.error({ err: error }, "Не удалось сохранить курсы валют");
    return NextResponse.json({ error: "Не удалось сохранить курсы валют" }, { status: 500 });
  }
});
