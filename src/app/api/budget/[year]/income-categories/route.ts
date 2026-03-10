import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createIncomeCategorySchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const POST = withAuth(async (request, session, context) => {
  const { year: yearStr } = await context!.params;
  const year = parseInt(yearStr, 10);

  if (isNaN(year)) {
    return NextResponse.json({ error: "Некорректный год" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = createIncomeCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { userId, name, type, taxRateId, formula } = result.data;

    const user = await prisma.user.findFirst({
      where: { id: userId, familyId: session.user.familyId },
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const budgetYear = await prisma.budgetYear.findUnique({
      where: { year_familyId: { year, familyId: session.user.familyId } },
    });

    if (!budgetYear) {
      return NextResponse.json({ error: "Бюджетный год не найден" }, { status: 404 });
    }

    const category = await prisma.budgetIncomeCategory.create({
      data: {
        userId,
        budgetYearId: budgetYear.id,
        name,
        type,
        taxRateId: taxRateId ?? null,
        formula: formula ?? null,
      },
      include: {
        taxRate: true,
        params: true,
        entries: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать категорию дохода");
    return NextResponse.json({ error: "Не удалось создать категорию дохода" }, { status: 500 });
  }
});
