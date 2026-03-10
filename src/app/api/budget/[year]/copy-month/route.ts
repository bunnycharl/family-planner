import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { copyMonthSchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const POST = withAuth(async (request, session, context) => {
  const { year: yearStr } = await context!.params;
  const year = parseInt(yearStr, 10);

  if (isNaN(year)) {
    return NextResponse.json({ error: "Некорректный год" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = copyMonthSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { fromMonth, toMonths } = result.data;

    const budgetYear = await prisma.budgetYear.findUnique({
      where: { year_familyId: { year, familyId: session.user.familyId } },
      include: {
        incomeCategories: {
          include: {
            entries: { where: { month: fromMonth } },
            params: {
              include: {
                values: { where: { month: fromMonth } },
              },
            },
          },
        },
        expenseGroups: {
          include: {
            categories: {
              include: {
                entries: { where: { month: fromMonth } },
              },
            },
          },
        },
        currencyRates: { where: { month: fromMonth } },
      },
    });

    if (!budgetYear) {
      return NextResponse.json({ error: "Бюджетный год не найден" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const operations: any[] = [];

    for (const toMonth of toMonths) {
      // Copy income entries
      for (const cat of budgetYear.incomeCategories) {
        for (const entry of cat.entries) {
          operations.push(
            prisma.budgetIncomeEntry.upsert({
              where: {
                incomeCategoryId_month: {
                  incomeCategoryId: cat.id,
                  month: toMonth,
                },
              },
              update: { amount: entry.amount },
              create: {
                incomeCategoryId: cat.id,
                month: toMonth,
                amount: entry.amount,
              },
            })
          );
        }

        // Copy formula param values
        for (const param of cat.params) {
          for (const val of param.values) {
            operations.push(
              prisma.formulaParamValue.upsert({
                where: {
                  formulaParamId_month: {
                    formulaParamId: param.id,
                    month: toMonth,
                  },
                },
                update: { value: val.value },
                create: {
                  formulaParamId: param.id,
                  month: toMonth,
                  value: val.value,
                },
              })
            );
          }
        }
      }

      // Copy expense entries
      for (const group of budgetYear.expenseGroups) {
        for (const cat of group.categories) {
          for (const entry of cat.entries) {
            operations.push(
              prisma.budgetExpenseEntry.upsert({
                where: {
                  expenseCategoryId_month: {
                    expenseCategoryId: cat.id,
                    month: toMonth,
                  },
                },
                update: { amount: entry.amount },
                create: {
                  expenseCategoryId: cat.id,
                  month: toMonth,
                  amount: entry.amount,
                },
              })
            );
          }
        }
      }

      // Copy currency rates
      for (const cr of budgetYear.currencyRates) {
        operations.push(
          prisma.currencyRate.upsert({
            where: {
              budgetYearId_currency_month: {
                budgetYearId: budgetYear.id,
                currency: cr.currency,
                month: toMonth,
              },
            },
            update: { rate: cr.rate },
            create: {
              budgetYearId: budgetYear.id,
              currency: cr.currency,
              month: toMonth,
              rate: cr.rate,
            },
          })
        );
      }
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }

    return NextResponse.json({ success: true, copiedToMonths: toMonths });
  } catch (error) {
    logger.error({ err: error }, "Не удалось скопировать месяц");
    return NextResponse.json({ error: "Не удалось скопировать месяц" }, { status: 500 });
  }
});
