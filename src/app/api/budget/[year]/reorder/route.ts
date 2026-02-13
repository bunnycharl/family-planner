import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { reorderSchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

const reorderBodySchema = z.object({
  type: z.enum(["taxRates", "expenseGroups", "expenseCategories"]),
  items: reorderSchema,
});

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json();
    const result = reorderBodySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { type, items } = result.data;

    const modelMap = {
      taxRates: prisma.taxRate,
      expenseGroups: prisma.budgetExpenseGroup,
      expenseCategories: prisma.budgetExpenseCategory,
    } as const;

    const model = modelMap[type];

    const operations = items.map((item) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (model as any).update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    );

    await prisma.$transaction(operations);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, "Не удалось изменить порядок элементов");
    return NextResponse.json({ error: "Не удалось изменить порядок элементов" }, { status: 500 });
  }
});
