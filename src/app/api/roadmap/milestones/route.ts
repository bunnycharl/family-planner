import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createMilestoneSchema } from "@/lib/validations/roadmap";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const result = createMilestoneSchema.safeParse(body);

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
      const maxPositionResult = await prisma.milestone.aggregate({
        where: { phaseId: data.phaseId },
        _max: { position: true },
      });
      position = (maxPositionResult._max.position ?? -1) + 1;
    }

    const milestone = await prisma.milestone.create({
      data: {
        name: data.name,
        details: data.details,
        categoryId: data.categoryId || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        phaseId: data.phaseId,
        position,
        isCompleted: data.isCompleted ?? false,
      },
      include: { category: true },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать веху роадмапа");
    return NextResponse.json({ error: "Не удалось создать веху" }, { status: 500 });
  }
});
