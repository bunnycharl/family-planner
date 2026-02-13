import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const POST = withAuth(async (request, _session, context) => {
  const { id: groupId } = await context!.params;

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Поле name обязательно" }, { status: 400 });
    }

    const maxPosition = await prisma.expenseGroupCategory.aggregate({
      where: { groupId },
      _max: { position: true },
    });

    const position = (maxPosition._max.position ?? -1) + 1;

    const category = await prisma.expenseGroupCategory.create({
      data: { groupId, name, position },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось добавить категорию в группу расходов");
    return NextResponse.json(
      { error: "Не удалось добавить категорию в группу расходов" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request, _session, context) => {
  const { id: groupId } = await context!.params;

  try {
    const body = await request.json();
    const { categoryId } = body;

    if (!categoryId) {
      return NextResponse.json({ error: "Поле categoryId обязательно" }, { status: 400 });
    }

    const category = await prisma.expenseGroupCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.groupId !== groupId) {
      return NextResponse.json({ error: "Категория не найдена в этой группе" }, { status: 404 });
    }

    const group = await prisma.expenseGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: "Группа не найдена" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.expenseEntry.deleteMany({
        where: {
          group: group.slug,
          category: category.name,
        },
      }),
      prisma.expenseGroupCategory.delete({
        where: { id: categoryId },
      }),
    ]);

    return NextResponse.json({ message: "Категория расходов удалена" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить категорию расходов");
    return NextResponse.json({ error: "Не удалось удалить категорию расходов" }, { status: 500 });
  }
});
