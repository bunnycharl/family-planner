import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createRoadmapPhaseSchema } from "@/lib/validations/roadmap";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async () => {
  try {
    const phases = await prisma.roadmapPhase.findMany({
      include: {
        tasks: {
          include: { category: true, assignee: true },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { position: "asc" },
    });

    return NextResponse.json(phases);
  } catch (error) {
    logger.error({ err: error }, "Не удалось загрузить фазы роадмапа");
    return NextResponse.json({ error: "Не удалось загрузить фазы" }, { status: 500 });
  }
});

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const result = createRoadmapPhaseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    let position = data.position;
    if (position === undefined) {
      const maxPositionResult = await prisma.roadmapPhase.aggregate({
        _max: { position: true },
      });
      position = (maxPositionResult._max.position ?? -1) + 1;
    }

    const phase = await prisma.roadmapPhase.create({
      data: {
        name: data.name,
        emoji: data.emoji,
        position,
      },
      include: {
        tasks: {
          include: { category: true, assignee: true },
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json(phase, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать фазу роадмапа");
    return NextResponse.json({ error: "Не удалось создать фазу" }, { status: 500 });
  }
});
