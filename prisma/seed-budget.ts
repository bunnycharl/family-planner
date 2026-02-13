import { PrismaClient } from "@prisma/client";

export async function seedBudget(prisma: PrismaClient) {
  const year = 2026;

  // 1. Create BudgetYear
  const budgetYear = await prisma.budgetYear.upsert({
    where: { year },
    update: {},
    create: { year, baseCurrency: "RUB" },
  });

  // 2. Tax Rates
  const taxNdfl = await prisma.taxRate.create({
    data: { budgetYearId: budgetYear.id, name: "НДФЛ 13%", rate: 0.13, sortOrder: 0 },
  });
  const taxUsn4 = await prisma.taxRate.create({
    data: { budgetYearId: budgetYear.id, name: "УСН 4%", rate: 0.04, sortOrder: 1 },
  });
  const taxSchool = await prisma.taxRate.create({
    data: { budgetYearId: budgetYear.id, name: "Школа 6%", rate: 0.06, sortOrder: 2 },
  });

  // 3. Family Members
  const nikita = await prisma.familyMember.create({
    data: { budgetYearId: budgetYear.id, name: "Никита", sortOrder: 0 },
  });
  const darya = await prisma.familyMember.create({
    data: { budgetYearId: budgetYear.id, name: "Дарья", sortOrder: 1 },
  });

  // 4. Income Categories — Nikita (FIXED)
  await prisma.budgetIncomeCategory.createMany({
    data: [
      { familyMemberId: nikita.id, name: "Аренда квартиры", type: "FIXED", sortOrder: 0 },
      {
        familyMemberId: nikita.id,
        name: "Инвестиции",
        type: "FIXED",
        taxRateId: taxNdfl.id,
        sortOrder: 1,
      },
      { familyMemberId: nikita.id, name: "Фриланс / работа / прочее", type: "FIXED", sortOrder: 2 },
    ],
  });

  // 5. Income Categories — Darya (FORMULA)
  const consultations = await prisma.budgetIncomeCategory.create({
    data: {
      familyMemberId: darya.id,
      name: "Консультации",
      type: "FORMULA",
      formula: "clients * price",
      taxRateId: taxUsn4.id,
      sortOrder: 0,
    },
  });

  const school = await prisma.budgetIncomeCategory.create({
    data: {
      familyMemberId: darya.id,
      name: "Школа",
      type: "FORMULA",
      formula: "lessons_per_week * price * work_days * 4",
      taxRateId: taxSchool.id,
      sortOrder: 1,
    },
  });

  // 6. Formula Params
  await prisma.formulaParam.createMany({
    data: [
      { incomeCategoryId: consultations.id, name: "Клиентов", paramKey: "clients", sortOrder: 0 },
      {
        incomeCategoryId: consultations.id,
        name: "Цена консультации",
        paramKey: "price",
        sortOrder: 1,
      },
      {
        incomeCategoryId: school.id,
        name: "Уроков/нед",
        paramKey: "lessons_per_week",
        sortOrder: 0,
      },
      { incomeCategoryId: school.id, name: "Цена урока", paramKey: "price", sortOrder: 1 },
      {
        incomeCategoryId: school.id,
        name: "Рабочих дней/нед",
        paramKey: "work_days",
        sortOrder: 2,
      },
    ],
  });

  // 7. Expense Groups + Categories
  const moscow = await prisma.budgetExpenseGroup.create({
    data: { budgetYearId: budgetYear.id, name: "Москва", currency: "RUB", sortOrder: 0 },
  });
  await prisma.budgetExpenseCategory.createMany({
    data: [
      { expenseGroupId: moscow.id, name: "Аренда", sortOrder: 0 },
      { expenseGroupId: moscow.id, name: "Продукты", sortOrder: 1 },
      { expenseGroupId: moscow.id, name: "Транспорт", sortOrder: 2 },
      { expenseGroupId: moscow.id, name: "Связь и подписки", sortOrder: 3 },
      { expenseGroupId: moscow.id, name: "Прочее", sortOrder: 4 },
    ],
  });

  const spain = await prisma.budgetExpenseGroup.create({
    data: { budgetYearId: budgetYear.id, name: "Испания", currency: "EUR", sortOrder: 1 },
  });
  await prisma.budgetExpenseCategory.createMany({
    data: [
      { expenseGroupId: spain.id, name: "Аренда", sortOrder: 0 },
      { expenseGroupId: spain.id, name: "Продукты", sortOrder: 1 },
      { expenseGroupId: spain.id, name: "Транспорт", sortOrder: 2 },
      { expenseGroupId: spain.id, name: "Прочее", sortOrder: 3 },
    ],
  });

  const onetime = await prisma.budgetExpenseGroup.create({
    data: { budgetYearId: budgetYear.id, name: "Разовые", currency: "RUB", sortOrder: 2 },
  });
  await prisma.budgetExpenseCategory.createMany({
    data: [
      { expenseGroupId: onetime.id, name: "Перелёты", sortOrder: 0 },
      { expenseGroupId: onetime.id, name: "Прочее", sortOrder: 1 },
    ],
  });

  console.log("Budget seed completed:");
  console.log(`  Year: ${year}`);
  console.log(`  Members: ${nikita.name}, ${darya.name}`);
  console.log(`  Tax rates: 3`);
  console.log(`  Expense groups: 3`);
}
