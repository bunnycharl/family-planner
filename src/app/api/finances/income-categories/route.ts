import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async () => {
  try {
    const categories = await prisma.financeIncomeCategory.findMany({
      include: {
        person: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ person: { name: "asc" } }, { position: "asc" }],
    });

    return NextResponse.json(categories);
  } catch (error) {
    logger.error({ err: error }, "Не удалось получить категории доходов");
    return NextResponse.json({ error: "Не удалось получить категории доходов" }, { status: 500 });
  }
});

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { personId, name } = body;

    if (!personId || !name) {
      return NextResponse.json({ error: "Поля personId и name обязательны" }, { status: 400 });
    }

    const maxPosition = await prisma.financeIncomeCategory.aggregate({
      where: { personId },
      _max: { position: true },
    });

    const position = (maxPosition._max.position ?? -1) + 1;

    const category = await prisma.financeIncomeCategory.create({
      data: { personId, name, position },
      include: {
        person: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать категорию дохода");
    return NextResponse.json({ error: "Не удалось создать категорию дохода" }, { status: 500 });
  }
});
