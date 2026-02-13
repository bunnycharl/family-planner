import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { upsertIncomeSchema } from "@/lib/validations/finance";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const personId = searchParams.get("personId");

  if (!year || !personId) {
    return NextResponse.json({ error: "Параметры year и personId обязательны" }, { status: 400 });
  }

  try {
    const entries = await prisma.incomeEntry.findMany({
      where: {
        personId,
        year: parseInt(year, 10),
      },
      orderBy: [{ month: "asc" }, { category: "asc" }],
    });

    return NextResponse.json(entries);
  } catch (error) {
    logger.error({ err: error }, "Не удалось получить записи доходов");
    return NextResponse.json({ error: "Не удалось получить записи доходов" }, { status: 500 });
  }
});

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json();
    const result = upsertIncomeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { personId, year, month, entries } = result.data;

    const upserted = await prisma.$transaction(
      entries.map((entry) =>
        prisma.incomeEntry.upsert({
          where: {
            personId_year_month_category: {
              personId,
              year,
              month,
              category: entry.category,
            },
          },
          update: { amount: entry.amount },
          create: {
            personId,
            year,
            month,
            category: entry.category,
            amount: entry.amount,
          },
        })
      )
    );

    return NextResponse.json(upserted);
  } catch (error) {
    logger.error({ err: error }, "Не удалось сохранить записи доходов");
    return NextResponse.json({ error: "Не удалось сохранить записи доходов" }, { status: 500 });
  }
});
