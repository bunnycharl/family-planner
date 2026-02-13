import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateTransactionSchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = updateTransactionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.transaction.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Транзакция не найдена" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (result.data.categoryId !== undefined) data.categoryId = result.data.categoryId;
    if (result.data.amount !== undefined) data.amount = result.data.amount;
    if (result.data.date !== undefined) data.date = new Date(result.data.date);
    if (result.data.description !== undefined) data.description = result.data.description;

    const transaction = await prisma.transaction.update({
      where: { id },
      data,
      include: { category: true },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    logger.error({ err: error }, "Не удалось обновить транзакцию");
    return NextResponse.json({ error: "Не удалось обновить транзакцию" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const existing = await prisma.transaction.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Транзакция не найдена" }, { status: 404 });
    }

    await prisma.transaction.delete({ where: { id } });

    return NextResponse.json({ message: "Транзакция удалена" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить транзакцию");
    return NextResponse.json({ error: "Не удалось удалить транзакцию" }, { status: 500 });
  }
});
