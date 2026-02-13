import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateMilestoneSchema } from "@/lib/validations/roadmap";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = updateMilestoneSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.milestone.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Веха не найдена" }, { status: 404 });
    }

    const data = result.data;

    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: { category: true },
    });

    return NextResponse.json(milestone);
  } catch (error) {
    logger.error({ err: error }, "Не удалось обновить веху роадмапа");
    return NextResponse.json({ error: "Не удалось обновить веху" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const existing = await prisma.milestone.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Веха не найдена" }, { status: 404 });
    }

    await prisma.milestone.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Веха удалена" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить веху роадмапа");
    return NextResponse.json({ error: "Не удалось удалить веху" }, { status: 500 });
  }
});
