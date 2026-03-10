import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createTransactionSchema } from "@/lib/finances/validations";
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
  const categoryId = searchParams.get("categoryId");

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

    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);

    const where: Record<string, unknown> = {
      category: { budgetYearId: budgetYear.id },
      date: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      include: { category: true },
    });

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      transactions,
      total: transactions.length,
      totalAmount,
    });
  } catch (error) {
    logger.error({ err: error }, "Не удалось загрузить транзакции");
    return NextResponse.json({ error: "Не удалось загрузить транзакции" }, { status: 500 });
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
    const result = createTransactionSchema.safeParse(body);

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

    // Verify that category belongs to this budget year
    const category = await prisma.transactionCategory.findFirst({
      where: {
        id: result.data.categoryId,
        budgetYearId: budgetYear.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Категория не найдена в этом бюджетном году" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        categoryId: result.data.categoryId,
        amount: result.data.amount,
        date: new Date(result.data.date),
        description: result.data.description ?? null,
      },
      include: { category: true },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать транзакцию");
    return NextResponse.json({ error: "Не удалось создать транзакцию" }, { status: 500 });
  }
});
