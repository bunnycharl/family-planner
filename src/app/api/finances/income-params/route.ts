import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { upsertIncomeParamsSchema } from "@/lib/validations/finance";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { computeDaryaIncome } from "@/lib/finance-utils";

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const personId = searchParams.get("personId");

  if (!year || !personId) {
    return NextResponse.json({ error: "Параметры year и personId обязательны" }, { status: 400 });
  }

  try {
    const params = await prisma.incomeParam.findMany({
      where: {
        personId,
        year: parseInt(year, 10),
      },
      orderBy: [{ month: "asc" }, { key: "asc" }],
    });

    return NextResponse.json(params);
  } catch (error) {
    logger.error({ err: error }, "Не удалось получить параметры дохода");
    return NextResponse.json({ error: "Не удалось получить параметры дохода" }, { status: 500 });
  }
});

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json();
    const result = upsertIncomeParamsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { personId, year, month, params } = result.data;

    // Upsert all params
    const upsertedParams = await prisma.$transaction(
      params.map((param) =>
        prisma.incomeParam.upsert({
          where: {
            personId_year_month_key: {
              personId,
              year,
              month,
              key: param.key,
            },
          },
          update: { value: param.value },
          create: {
            personId,
            year,
            month,
            key: param.key,
            value: param.value,
          },
        })
      )
    );

    // Compute Darya's income from params and upsert corresponding IncomeEntry rows
    const paramMap: Record<string, number> = {};
    for (const p of params) {
      paramMap[p.key] = p.value;
    }

    const { consultationIncome, schoolIncome } = computeDaryaIncome(paramMap);

    const incomeEntries = await prisma.$transaction([
      prisma.incomeEntry.upsert({
        where: {
          personId_year_month_category: {
            personId,
            year,
            month,
            category: "Консультации",
          },
        },
        update: { amount: Math.round(consultationIncome) },
        create: {
          personId,
          year,
          month,
          category: "Консультации",
          amount: Math.round(consultationIncome),
        },
      }),
      prisma.incomeEntry.upsert({
        where: {
          personId_year_month_category: {
            personId,
            year,
            month,
            category: "Школа",
          },
        },
        update: { amount: Math.round(schoolIncome) },
        create: {
          personId,
          year,
          month,
          category: "Школа",
          amount: Math.round(schoolIncome),
        },
      }),
    ]);

    return NextResponse.json({ params: upsertedParams, incomeEntries });
  } catch (error) {
    logger.error({ err: error }, "Не удалось сохранить параметры дохода");
    return NextResponse.json({ error: "Не удалось сохранить параметры дохода" }, { status: 500 });
  }
});
