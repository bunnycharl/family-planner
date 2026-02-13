import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const DELETE = withAuth(async (_request, _session, context) => {
  const { id } = await context!.params;

  try {
    await prisma.financeTaxRule.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Налоговое правило удалено" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить налоговое правило");
    return NextResponse.json({ error: "Не удалось удалить налоговое правило" }, { status: 500 });
  }
});
