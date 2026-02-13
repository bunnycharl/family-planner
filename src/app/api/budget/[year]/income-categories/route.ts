import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createIncomeCategorySchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const result = createIncomeCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { familyMemberId, name, type, taxRateId, formula } = result.data;

    const member = await prisma.familyMember.findUnique({
      where: { id: familyMemberId },
    });

    if (!member) {
      return NextResponse.json({ error: "Член семьи не найден" }, { status: 404 });
    }

    const maxSortOrder = await prisma.budgetIncomeCategory.aggregate({
      where: { familyMemberId },
      _max: { sortOrder: true },
    });

    const sortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const category = await prisma.budgetIncomeCategory.create({
      data: {
        familyMemberId,
        name,
        type,
        taxRateId: taxRateId ?? null,
        formula: formula ?? null,
        sortOrder,
      },
      include: {
        taxRate: true,
        params: true,
        entries: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать категорию дохода");
    return NextResponse.json({ error: "Не удалось создать категорию дохода" }, { status: 500 });
  }
});
