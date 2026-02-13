import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, _session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const { name, position } = body;

    if (name === undefined && position === undefined) {
      return NextResponse.json({ error: "Необходимо указать name или position" }, { status: 400 });
    }

    const data: { name?: string; position?: number } = {};
    if (name !== undefined) data.name = name;
    if (position !== undefined) data.position = position;

    const category = await prisma.financeIncomeCategory.update({
      where: { id },
      data,
      include: {
        person: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    logger.error({ err: error }, "Не удалось обновить категорию дохода");
    return NextResponse.json({ error: "Не удалось обновить категорию дохода" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (_request, _session, context) => {
  const { id } = await context!.params;

  try {
    const category = await prisma.financeIncomeCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.incomeEntry.deleteMany({
        where: {
          personId: category.personId,
          category: category.name,
        },
      }),
      prisma.financeIncomeCategory.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ message: "Категория дохода удалена" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить категорию дохода");
    return NextResponse.json({ error: "Не удалось удалить категорию дохода" }, { status: 500 });
  }
});
