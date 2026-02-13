import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, _session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const { name, slug, currency, position } = body;

    if (
      name === undefined &&
      slug === undefined &&
      currency === undefined &&
      position === undefined
    ) {
      return NextResponse.json(
        { error: "Необходимо указать хотя бы одно поле для обновления" },
        { status: 400 }
      );
    }

    const data: { name?: string; slug?: string; currency?: string; position?: number } = {};
    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug;
    if (currency !== undefined) data.currency = currency;
    if (position !== undefined) data.position = position;

    const group = await prisma.expenseGroup.update({
      where: { id },
      data,
      include: {
        categories: { orderBy: { position: "asc" } },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    logger.error({ err: error }, "Не удалось обновить группу расходов");
    return NextResponse.json({ error: "Не удалось обновить группу расходов" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (_request, _session, context) => {
  const { id } = await context!.params;

  try {
    const group = await prisma.expenseGroup.findUnique({
      where: { id },
    });

    if (!group) {
      return NextResponse.json({ error: "Группа не найдена" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.expenseEntry.deleteMany({
        where: { group: group.slug },
      }),
      prisma.expenseGroup.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ message: "Группа расходов удалена" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить группу расходов");
    return NextResponse.json({ error: "Не удалось удалить группу расходов" }, { status: 500 });
  }
});
