import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const incomeCategories: Record<string, string[]> = {
  nikita: ["Аренда квартиры", "Инвестиции", "Фриланс / работа / прочее"],
  darya: ["Консультации", "Школа"],
};

const taxRules: Record<string, { category: string; rate: number }[]> = {
  nikita: [{ category: "Инвестиции", rate: 0.13 }],
  darya: [
    { category: "Консультации", rate: 0.04 },
    { category: "Школа", rate: 0.06 },
  ],
};

const expenseGroups: {
  slug: string;
  name: string;
  currency: string;
  position: number;
  categories: string[];
}[] = [
  {
    slug: "moscow",
    name: "Москва",
    currency: "RUB",
    position: 0,
    categories: [
      "Продукты",
      "Рестораны / кафе",
      "Транспорт",
      "Коммунальные",
      "Собака (Бруно)",
      "Подписки / сервисы",
      "Здоровье / аптека",
      "Одежда / быт",
      "Связь / интернет",
      "Развлечения",
      "Прочее",
    ],
  },
  {
    slug: "spain",
    name: "Испания",
    currency: "EUR",
    position: 1,
    categories: ["Аренда", "Продукты", "Транспорт", "Связь", "Прочее"],
  },
  {
    slug: "onetime",
    name: "Разовые",
    currency: "RUB",
    position: 2,
    categories: ["Разведка Европы", "Юрист VIP", "Переезд (билеты, депозит)", "Семья"],
  },
];

async function main() {
  console.log("Seeding finance configuration...");

  // 1. Fetch existing FinancePerson records
  const persons = await prisma.financePerson.findMany();
  const personBySlug = new Map(persons.map((p) => [p.slug, p]));

  // 2. Upsert FinanceIncomeCategory records per person
  for (const [slug, categories] of Object.entries(incomeCategories)) {
    const person = personBySlug.get(slug);
    if (!person) {
      console.log(`  Warning: person "${slug}" not found, skipping income categories`);
      continue;
    }

    for (let i = 0; i < categories.length; i++) {
      await prisma.financeIncomeCategory.upsert({
        where: {
          personId_name: {
            personId: person.id,
            name: categories[i],
          },
        },
        update: { position: i },
        create: {
          personId: person.id,
          name: categories[i],
          position: i,
        },
      });
    }

    console.log(`  ${person.name}: ${categories.length} income categories`);
  }

  // 3. Upsert FinanceTaxRule records per person
  for (const [slug, rules] of Object.entries(taxRules)) {
    const person = personBySlug.get(slug);
    if (!person) {
      console.log(`  Warning: person "${slug}" not found, skipping tax rules`);
      continue;
    }

    for (const rule of rules) {
      await prisma.financeTaxRule.upsert({
        where: {
          personId_category: {
            personId: person.id,
            category: rule.category,
          },
        },
        update: { rate: rule.rate },
        create: {
          personId: person.id,
          category: rule.category,
          rate: rule.rate,
        },
      });
    }

    console.log(`  ${person.name}: ${rules.length} tax rules`);
  }

  // 4. Upsert ExpenseGroup and ExpenseGroupCategory records
  for (const groupData of expenseGroups) {
    const group = await prisma.expenseGroup.upsert({
      where: { slug: groupData.slug },
      update: {
        name: groupData.name,
        currency: groupData.currency,
        position: groupData.position,
      },
      create: {
        slug: groupData.slug,
        name: groupData.name,
        currency: groupData.currency,
        position: groupData.position,
      },
    });

    for (let i = 0; i < groupData.categories.length; i++) {
      await prisma.expenseGroupCategory.upsert({
        where: {
          groupId_name: {
            groupId: group.id,
            name: groupData.categories[i],
          },
        },
        update: { position: i },
        create: {
          groupId: group.id,
          name: groupData.categories[i],
          position: i,
        },
      });
    }

    console.log(`  ${groupData.name}: ${groupData.categories.length} expense categories`);
  }

  console.log("Finance configuration seed completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
