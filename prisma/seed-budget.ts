import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedBudget(prisma: PrismaClient) {
  const year = 2026;
  const defaultFamilyId = "default-family-id";

  // 1. Create BudgetYear
  const budgetYear = await prisma.budgetYear.upsert({
    where: { year_familyId: { year, familyId: defaultFamilyId } },
    update: {},
    create: { year, baseCurrency: "RUB", familyId: defaultFamilyId },
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

  // 3. Users
  const hashedPassword = await bcrypt.hash("password", 10);
  const nikita = await prisma.user.upsert({
    where: { email: "nikita@example.com" },
    update: {},
    create: {
      name: "Никита",
      email: "nikita@example.com",
      hashedPassword,
      familyId: defaultFamilyId,
    },
  });
  const darya = await prisma.user.upsert({
    where: { email: "darya@example.com" },
    update: {},
    create: {
      name: "Дарья",
      email: "darya@example.com",
      hashedPassword,
      familyId: defaultFamilyId,
    },
  });

  // 4. Income Categories — Nikita (FIXED)
  await prisma.budgetIncomeCategory.createMany({
    data: [
      {
        budgetYearId: budgetYear.id,
        userId: nikita.id,
        name: "Аренда квартиры",
        type: "FIXED",
      },
      {
        budgetYearId: budgetYear.id,
        userId: nikita.id,
        name: "Инвестиции",
        type: "FIXED",
        taxRateId: taxNdfl.id,
      },
      {
        budgetYearId: budgetYear.id,
        userId: nikita.id,
        name: "Фриланс / работа / прочее",
        type: "FIXED",
      },
    ],
  });

  // 5. Income Categories — Darya (FORMULA)
  const consultations = await prisma.budgetIncomeCategory.create({
    data: {
      budgetYearId: budgetYear.id,
      userId: darya.id,
      name: "Консультации",
      type: "FORMULA",
      formula: "clients * price",
      taxRateId: taxUsn4.id,
    },
  });

  const school = await prisma.budgetIncomeCategory.create({
    data: {
      budgetYearId: budgetYear.id,
      userId: darya.id,
      name: "Школа",
      type: "FORMULA",
      formula: "lessons_per_week * price * work_days * 4",
      taxRateId: taxSchool.id,
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
  console.log(`  Users: ${nikita.name}, ${darya.name}`);
  console.log(`  Tax rates: 3`);
  console.log(`  Expense groups: 3`);
}
