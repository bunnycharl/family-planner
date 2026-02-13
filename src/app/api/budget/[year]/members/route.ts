import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createMemberSchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async (request, session, context) => {
  const { year: yearStr } = await context!.params;
  const year = parseInt(yearStr, 10);

  if (isNaN(year)) {
    return NextResponse.json({ error: "Некорректный год" }, { status: 400 });
  }

  try {
    const budgetYear = await prisma.budgetYear.findUnique({
      where: { year },
    });

    if (!budgetYear) {
      return NextResponse.json({ error: "Бюджетный год не найден" }, { status: 404 });
    }

    const members = await prisma.familyMember.findMany({
      where: { budgetYearId: budgetYear.id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    logger.error({ err: error }, "Не удалось загрузить членов семьи");
    return NextResponse.json({ error: "Не удалось загрузить членов семьи" }, { status: 500 });
  }
});

export const POST = withAuth(async (request, session, context) => {
  const { year: yearStr } = await context!.params;
  const year = parseInt(yearStr, 10);

  if (isNaN(year)) {
    return NextResponse.json({ error: "Некорректный год" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = createMemberSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const budgetYear = await prisma.budgetYear.findUnique({
      where: { year },
    });

    if (!budgetYear) {
      return NextResponse.json({ error: "Бюджетный год не найден" }, { status: 404 });
    }

    const maxSortOrder = await prisma.familyMember.aggregate({
      where: { budgetYearId: budgetYear.id },
      _max: { sortOrder: true },
    });

    const sortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const member = await prisma.familyMember.create({
      data: {
        budgetYearId: budgetYear.id,
        name: result.data.name,
        sortOrder,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать члена семьи");
    return NextResponse.json({ error: "Не удалось создать члена семьи" }, { status: 500 });
  }
});
