import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateTransactionCategorySchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = updateTransactionCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.transactionCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });
    }

    const category = await prisma.transactionCategory.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(category);
  } catch (error) {
    logger.error({ err: error }, "Не удалось обновить категорию транзакций");
    return NextResponse.json(
      { error: "Не удалось обновить категорию транзакций" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const existing = await prisma.transactionCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });
    }

    await prisma.transactionCategory.delete({ where: { id } });

    return NextResponse.json({ message: "Категория удалена" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить категорию транзакций");
    return NextResponse.json({ error: "Не удалось удалить категорию транзакций" }, { status: 500 });
  }
});
