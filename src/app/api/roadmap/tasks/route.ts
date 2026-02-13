import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createRoadmapTaskSchema } from "@/lib/validations/roadmap";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const result = createRoadmapTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    const phase = await prisma.roadmapPhase.findUnique({
      where: { id: data.phaseId },
    });
    if (!phase) {
      return NextResponse.json({ error: "Фаза не найдена" }, { status: 404 });
    }

    let position = data.position;
    if (position === undefined) {
      const maxPositionResult = await prisma.roadmapTask.aggregate({
        where: { phaseId: data.phaseId },
        _max: { position: true },
      });
      position = (maxPositionResult._max.position ?? -1) + 1;
    }

    const task = await prisma.roadmapTask.create({
      data: {
        name: data.name,
        details: data.details,
        taskType: data.taskType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        phaseId: data.phaseId,
        position,
        isCompleted: data.isCompleted ?? false,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать задачу роадмапа");
    return NextResponse.json({ error: "Не удалось создать задачу" }, { status: 500 });
  }
});
