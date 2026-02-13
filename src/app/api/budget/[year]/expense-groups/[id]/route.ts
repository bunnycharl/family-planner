import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateExpenseGroupSchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = updateExpenseGroupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.budgetExpenseGroup.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Группа расходов не найдена" }, { status: 404 });
    }

    const group = await prisma.budgetExpenseGroup.update({
      where: { id },
      data: result.data,
      include: {
        categories: {
          orderBy: { sortOrder: "asc" },
          include: { entries: true },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    logger.error({ err: error }, "Не удалось обновить группу расходов");
    return NextResponse.json({ error: "Не удалось обновить группу расходов" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const existing = await prisma.budgetExpenseGroup.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Группа расходов не найдена" }, { status: 404 });
    }

    await prisma.budgetExpenseGroup.delete({ where: { id } });

    return NextResponse.json({ message: "Группа расходов удалена" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить группу расходов");
    return NextResponse.json({ error: "Не удалось удалить группу расходов" }, { status: 500 });
  }
});
