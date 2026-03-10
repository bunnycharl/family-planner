import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateRoadmapPhaseSchema } from "@/lib/validations/roadmap";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = updateRoadmapPhaseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.roadmapPhase.findFirst({
      where: { id, familyId: session.user.familyId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Фаза не найдена" }, { status: 404 });
    }

    const phase = await prisma.roadmapPhase.update({
      where: { id },
      data: result.data,
      include: {
        tasks: {
          include: { category: true, assignee: true },
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json(phase);
  } catch (error) {
    logger.error({ err: error }, "Не удалось обновить фазу роадмапа");
    return NextResponse.json({ error: "Не удалось обновить фазу" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const existing = await prisma.roadmapPhase.findFirst({
      where: { id, familyId: session.user.familyId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Фаза не найдена" }, { status: 404 });
    }

    await prisma.roadmapPhase.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Фаза удалена" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить фазу роадмапа");
    return NextResponse.json({ error: "Не удалось удалить фазу" }, { status: 500 });
  }
});
