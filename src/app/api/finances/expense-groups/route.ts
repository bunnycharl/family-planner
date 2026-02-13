import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async () => {
  try {
    const groups = await prisma.expenseGroup.findMany({
      include: {
        categories: { orderBy: { position: "asc" } },
      },
      orderBy: { position: "asc" },
    });

    return NextResponse.json(groups);
  } catch (error) {
    logger.error({ err: error }, "Не удалось получить группы расходов");
    return NextResponse.json({ error: "Не удалось получить группы расходов" }, { status: 500 });
  }
});

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { name, slug, currency } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Поля name и slug обязательны" }, { status: 400 });
    }

    const maxPosition = await prisma.expenseGroup.aggregate({
      _max: { position: true },
    });

    const position = (maxPosition._max.position ?? -1) + 1;

    const group = await prisma.expenseGroup.create({
      data: {
        name,
        slug,
        position,
        ...(currency !== undefined && { currency }),
      },
      include: {
        categories: { orderBy: { position: "asc" } },
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать группу расходов");
    return NextResponse.json({ error: "Не удалось создать группу расходов" }, { status: 500 });
  }
});
