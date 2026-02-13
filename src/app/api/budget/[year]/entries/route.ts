import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { bulkUpsertEntriesSchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, session, context) => {
  const { year: yearStr } = await context!.params;
  const year = parseInt(yearStr, 10);

  if (isNaN(year)) {
    return NextResponse.json({ error: "Некорректный год" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = bulkUpsertEntriesSchema.safeParse(body);

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

    const { incomeEntries, formulaParamValues, expenseEntries, currencyRates } = result.data;

    const operations: Parameters<typeof prisma.$transaction>[0] = [];

    if (incomeEntries) {
      for (const entry of incomeEntries) {
        operations.push(
          prisma.budgetIncomeEntry.upsert({
            where: {
              incomeCategoryId_month: {
                incomeCategoryId: entry.incomeCategoryId,
                month: entry.month,
              },
            },
            update: { amount: entry.amount },
            create: {
              incomeCategoryId: entry.incomeCategoryId,
              month: entry.month,
              amount: entry.amount,
            },
          })
        );
      }
    }

    if (formulaParamValues) {
      for (const pv of formulaParamValues) {
        operations.push(
          prisma.formulaParamValue.upsert({
            where: {
              formulaParamId_month: {
                formulaParamId: pv.formulaParamId,
                month: pv.month,
              },
            },
            update: { value: pv.value },
            create: {
              formulaParamId: pv.formulaParamId,
              month: pv.month,
              value: pv.value,
            },
          })
        );
      }
    }

    if (expenseEntries) {
      for (const entry of expenseEntries) {
        operations.push(
          prisma.budgetExpenseEntry.upsert({
            where: {
              expenseCategoryId_month: {
                expenseCategoryId: entry.expenseCategoryId,
                month: entry.month,
              },
            },
            update: { amount: entry.amount },
            create: {
              expenseCategoryId: entry.expenseCategoryId,
              month: entry.month,
              amount: entry.amount,
            },
          })
        );
      }
    }

    if (currencyRates) {
      for (const cr of currencyRates) {
        operations.push(
          prisma.currencyRate.upsert({
            where: {
              budgetYearId_currency_month: {
                budgetYearId: budgetYear.id,
                currency: cr.currency,
                month: cr.month,
              },
            },
            update: { rate: cr.rate },
            create: {
              budgetYearId: budgetYear.id,
              currency: cr.currency,
              month: cr.month,
              rate: cr.rate,
            },
          })
        );
      }
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, "Не удалось сохранить записи бюджета");
    return NextResponse.json({ error: "Не удалось сохранить записи бюджета" }, { status: 500 });
  }
});
