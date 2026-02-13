import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateTaxRateSchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = updateTaxRateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.taxRate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Налоговая ставка не найдена" }, { status: 404 });
    }

    const taxRate = await prisma.taxRate.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(taxRate);
  } catch (error) {
    logger.error({ err: error }, "Не удалось обновить налоговую ставку");
    return NextResponse.json({ error: "Не удалось обновить налоговую ставку" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const existing = await prisma.taxRate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Налоговая ставка не найдена" }, { status: 404 });
    }

    await prisma.taxRate.delete({ where: { id } });

    return NextResponse.json({ message: "Налоговая ставка удалена" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить налоговую ставку");
    return NextResponse.json({ error: "Не удалось удалить налоговую ставку" }, { status: 500 });
  }
});
