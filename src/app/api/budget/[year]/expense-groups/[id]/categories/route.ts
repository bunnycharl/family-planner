import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createExpenseCategorySchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const POST = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = createExpenseCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const group = await prisma.budgetExpenseGroup.findUnique({
      where: { id },
    });

    if (!group) {
      return NextResponse.json({ error: "Группа расходов не найдена" }, { status: 404 });
    }

    const maxSortOrder = await prisma.budgetExpenseCategory.aggregate({
      where: { expenseGroupId: id },
      _max: { sortOrder: true },
    });

    const sortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const category = await prisma.budgetExpenseCategory.create({
      data: {
        expenseGroupId: id,
        name: result.data.name,
        sortOrder,
      },
      include: { entries: true },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать категорию расходов");
    return NextResponse.json({ error: "Не удалось создать категорию расходов" }, { status: 500 });
  }
});
