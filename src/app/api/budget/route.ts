import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createBudgetYearSchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const POST = withAuth(async (request, session) => {
  try {
    const body = await request.json();
    const result = createBudgetYearSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { year, baseCurrency } = result.data;

    const existing = await prisma.budgetYear.findUnique({
      where: { year_familyId: { year, familyId: session.user.familyId } },
    });

    if (existing) {
      return NextResponse.json({ error: "Бюджетный год уже существует" }, { status: 409 });
    }

    const budgetYear = await prisma.budgetYear.create({
      data: { year, baseCurrency, familyId: session.user.familyId },
    });

    return NextResponse.json(budgetYear, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать бюджетный год");
    return NextResponse.json({ error: "Не удалось создать бюджетный год" }, { status: 500 });
  }
});
