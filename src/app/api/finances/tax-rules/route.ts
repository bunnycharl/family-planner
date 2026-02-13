import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async () => {
  try {
    const taxRules = await prisma.financeTaxRule.findMany({
      include: {
        person: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { person: { name: "asc" } },
    });

    return NextResponse.json(taxRules);
  } catch (error) {
    logger.error({ err: error }, "Не удалось получить налоговые правила");
    return NextResponse.json({ error: "Не удалось получить налоговые правила" }, { status: 500 });
  }
});

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { personId, category, rate } = body;

    if (!personId || !category || rate === undefined) {
      return NextResponse.json(
        { error: "Поля personId, category и rate обязательны" },
        { status: 400 }
      );
    }

    const taxRule = await prisma.financeTaxRule.upsert({
      where: {
        personId_category: { personId, category },
      },
      update: { rate },
      create: { personId, category, rate },
      include: {
        person: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(taxRule);
  } catch (error) {
    logger.error({ err: error }, "Не удалось сохранить налоговое правило");
    return NextResponse.json({ error: "Не удалось сохранить налоговое правило" }, { status: 500 });
  }
});
