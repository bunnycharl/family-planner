import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async () => {
  try {
    const taskTypes = await prisma.roadmapTaskType.findMany({
      orderBy: { position: "asc" },
    });

    return NextResponse.json(taskTypes);
  } catch (error) {
    logger.error({ err: error }, "Не удалось загрузить типы задач роадмапа");
    return NextResponse.json({ error: "Не удалось загрузить типы задач" }, { status: 500 });
  }
});
