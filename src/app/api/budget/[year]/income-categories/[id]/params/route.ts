import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createFormulaParamSchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const category = await prisma.budgetIncomeCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: "Категория дохода не найдена" }, { status: 404 });
    }

    const params = await prisma.formulaParam.findMany({
      where: { incomeCategoryId: id },
      orderBy: { sortOrder: "asc" },
      include: { values: true },
    });

    return NextResponse.json(params);
  } catch (error) {
    logger.error({ err: error }, "Не удалось загрузить параметры формулы");
    return NextResponse.json({ error: "Не удалось загрузить параметры формулы" }, { status: 500 });
  }
});

export const POST = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = createFormulaParamSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const category = await prisma.budgetIncomeCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: "Категория дохода не найдена" }, { status: 404 });
    }

    const maxSortOrder = await prisma.formulaParam.aggregate({
      where: { incomeCategoryId: id },
      _max: { sortOrder: true },
    });

    const sortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const param = await prisma.formulaParam.create({
      data: {
        incomeCategoryId: id,
        name: result.data.name,
        paramKey: result.data.paramKey,
        sortOrder,
      },
      include: { values: true },
    });

    return NextResponse.json(param, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать параметр формулы");
    return NextResponse.json({ error: "Не удалось создать параметр формулы" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { paramId } = body;

    if (!paramId || typeof paramId !== "string") {
      return NextResponse.json({ error: "Необходимо указать paramId" }, { status: 400 });
    }

    const existing = await prisma.formulaParam.findUnique({
      where: { id: paramId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Параметр формулы не найден" }, { status: 404 });
    }

    await prisma.formulaParam.delete({ where: { id: paramId } });

    return NextResponse.json({ message: "Параметр формулы удалён" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить параметр формулы");
    return NextResponse.json({ error: "Не удалось удалить параметр формулы" }, { status: 500 });
  }
});
