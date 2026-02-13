import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateRoadmapTaskSchema } from "@/lib/validations/roadmap";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = updateRoadmapTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.roadmapTask.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

    const data = result.data;

    const task = await prisma.roadmapTask.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    logger.error({ err: error }, "Не удалось обновить задачу роадмапа");
    return NextResponse.json({ error: "Не удалось обновить задачу" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const existing = await prisma.roadmapTask.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

    await prisma.roadmapTask.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Задача удалена" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить задачу роадмапа");
    return NextResponse.json({ error: "Не удалось удалить задачу" }, { status: 500 });
  }
});
