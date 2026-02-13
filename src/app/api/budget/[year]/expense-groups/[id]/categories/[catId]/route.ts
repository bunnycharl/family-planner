import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateExpenseCategorySchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, session, context) => {
  const { catId } = await context!.params;

  try {
    const body = await request.json();
    const result = updateExpenseCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.budgetExpenseCategory.findUnique({
      where: { id: catId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Категория расходов не найдена" }, { status: 404 });
    }

    const category = await prisma.budgetExpenseCategory.update({
      where: { id: catId },
      data: result.data,
      include: { entries: true },
    });

    return NextResponse.json(category);
  } catch (error) {
    logger.error({ err: error }, "Не удалось обновить категорию расходов");
    return NextResponse.json({ error: "Не удалось обновить категорию расходов" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, session, context) => {
  const { catId } = await context!.params;

  try {
    const existing = await prisma.budgetExpenseCategory.findUnique({
      where: { id: catId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Категория расходов не найдена" }, { status: 404 });
    }

    await prisma.budgetExpenseCategory.delete({ where: { id: catId } });

    return NextResponse.json({ message: "Категория расходов удалена" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить категорию расходов");
    return NextResponse.json({ error: "Не удалось удалить категорию расходов" }, { status: 500 });
  }
});
