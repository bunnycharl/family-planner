import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateIncomeCategorySchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = updateIncomeCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.budgetIncomeCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Категория дохода не найдена" }, { status: 404 });
    }

    const category = await prisma.budgetIncomeCategory.update({
      where: { id },
      data: result.data,
      include: {
        taxRate: true,
        params: { orderBy: { sortOrder: "asc" }, include: { values: true } },
        entries: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    logger.error({ err: error }, "Не удалось обновить категорию дохода");
    return NextResponse.json({ error: "Не удалось обновить категорию дохода" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const existing = await prisma.budgetIncomeCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Категория дохода не найдена" }, { status: 404 });
    }

    await prisma.budgetIncomeCategory.delete({ where: { id } });

    return NextResponse.json({ message: "Категория дохода удалена" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить категорию дохода");
    return NextResponse.json({ error: "Не удалось удалить категорию дохода" }, { status: 500 });
  }
});
