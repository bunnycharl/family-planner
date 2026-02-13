import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { upsertExpensesSchema } from "@/lib/validations/finance";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const group = searchParams.get("group");

  if (!year) {
    return NextResponse.json({ error: "Параметр year обязателен" }, { status: 400 });
  }

  const where: Record<string, unknown> = {
    year: parseInt(year, 10),
  };

  if (group) {
    where.group = group;
  }

  try {
    const entries = await prisma.expenseEntry.findMany({
      where,
      orderBy: [{ month: "asc" }, { group: "asc" }, { category: "asc" }],
    });

    return NextResponse.json(entries);
  } catch (error) {
    logger.error({ err: error }, "Не удалось получить записи расходов");
    return NextResponse.json({ error: "Не удалось получить записи расходов" }, { status: 500 });
  }
});

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json();
    const result = upsertExpensesSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { year, month, group, entries } = result.data;

    const upserted = await prisma.$transaction(
      entries.map((entry) =>
        prisma.expenseEntry.upsert({
          where: {
            year_month_group_category: {
              year,
              month,
              group,
              category: entry.category,
            },
          },
          update: { amount: entry.amount },
          create: {
            year,
            month,
            group,
            category: entry.category,
            amount: entry.amount,
          },
        })
      )
    );

    return NextResponse.json(upserted);
  } catch (error) {
    logger.error({ err: error }, "Не удалось сохранить записи расходов");
    return NextResponse.json({ error: "Не удалось сохранить записи расходов" }, { status: 500 });
  }
});
