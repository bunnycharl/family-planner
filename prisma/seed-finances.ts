import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();
const EXCELS_DIR = join(__dirname, "..", "excels");
const YEAR = 2026;

// Months Feb(2) through Dec(12) are in CSV columns 2..12 (0-indexed)
const MONTH_COLUMNS_START = 2;

function parseAmount(raw: string): number {
  if (!raw || !raw.trim()) return 0;
  const cleaned = raw
    .replace(/[₽€%\s\u00a0]/g, "")
    .replace(",", ".")
    .trim();
  return cleaned ? parseFloat(cleaned) || 0 : 0;
}

function readCsv(filename: string): string[][] {
  const content = readFileSync(join(EXCELS_DIR, filename), "utf-8");
  return content
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const fields: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          fields.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      fields.push(current);
      return fields;
    });
}

function getMonthValue(row: string[], colIndex: number): number {
  return parseAmount(row[colIndex] || "");
}

async function seedNikitaIncome(nikitaId: string) {
  const rows = readCsv("Family Finances 2026.xlsx - Никита.csv");

  // Row mapping by label
  const incomeCategories: Record<string, string> = {
    "Аренда квартиры": "rent",
    Инвестиции: "investments",
    "Фриланс / работа / прочее": "freelance",
  };

  for (const row of rows) {
    const label = row[0]?.trim();
    const categorySlug = incomeCategories[label];
    if (!categorySlug) continue;

    for (let col = MONTH_COLUMNS_START; col <= 12; col++) {
      const month = col; // col 2 = Feb (month 2), col 12 = Dec (month 12)
      const amount = getMonthValue(row, col);

      await prisma.incomeEntry.upsert({
        where: {
          personId_year_month_category: {
            personId: nikitaId,
            year: YEAR,
            month,
            category: categorySlug,
          },
        },
        update: { amount },
        create: {
          personId: nikitaId,
          year: YEAR,
          month,
          category: categorySlug,
          amount,
        },
      });
    }
  }

  console.log("  Nikita income entries imported");
}

async function seedDaryaParams(daryaId: string) {
  const rows = readCsv("Family Finances 2026.xlsx - Дарья.csv");

  const paramMapping: Record<string, string> = {
    "Кол-во клиентов": "clients",
    "Цена консультации (₽)": "consultation_price",
    "Уроков в школе / неделю": "school_lessons_per_week",
    "Цена урока в школе (₽)": "lesson_price",
    "Рабочих дней / неделю (консульт.)": "work_days_per_week",
    "Недель в месяце (среднее)": "weeks_per_month",
  };

  // Collect param values per month for income computation
  const monthParams: Record<number, Record<string, number>> = {};

  for (const row of rows) {
    const label = row[0]?.trim();
    const paramKey = paramMapping[label];
    if (!paramKey) continue;

    for (let col = MONTH_COLUMNS_START; col <= 12; col++) {
      const month = col;
      const value = getMonthValue(row, col);

      await prisma.incomeParam.upsert({
        where: {
          personId_year_month_key: {
            personId: daryaId,
            year: YEAR,
            month,
            key: paramKey,
          },
        },
        update: { value },
        create: {
          personId: daryaId,
          year: YEAR,
          month,
          key: paramKey,
          value,
        },
      });

      if (!monthParams[month]) monthParams[month] = {};
      monthParams[month][paramKey] = value;
    }
  }

  console.log("  Darya income params imported");

  // Compute and upsert income entries for Darya
  // Formula matches the spreadsheet:
  //   consultations = clients * consultation_price * weeks_per_month
  //   school = school_lessons_per_week * lesson_price * weeks_per_month
  for (let month = 2; month <= 12; month++) {
    const p = monthParams[month];
    if (!p) continue;

    const consultationIncome =
      (p.clients || 0) * (p.consultation_price || 0) * (p.weeks_per_month || 0);

    const schoolIncome =
      (p.school_lessons_per_week || 0) * (p.lesson_price || 0) * (p.weeks_per_month || 0);

    for (const [category, amount] of [
      ["consultations", consultationIncome],
      ["school", schoolIncome],
    ] as const) {
      await prisma.incomeEntry.upsert({
        where: {
          personId_year_month_category: {
            personId: daryaId,
            year: YEAR,
            month,
            category,
          },
        },
        update: { amount },
        create: {
          personId: daryaId,
          year: YEAR,
          month,
          category,
          amount,
        },
      });
    }
  }

  console.log("  Darya income entries computed and imported");
}

async function seedExpenses() {
  const rows = readCsv("Family Finances 2026.xlsx - Расходы.csv");

  // 1. Parse exchange rates (row with "Курс EUR/RUB")
  const eurRubRow = rows.find((r) => r[0]?.trim() === "Курс EUR/RUB");
  if (eurRubRow) {
    for (let col = MONTH_COLUMNS_START; col <= 12; col++) {
      const month = col;
      const eurRub = getMonthValue(eurRubRow, col);

      await prisma.exchangeRate.upsert({
        where: { year_month: { year: YEAR, month } },
        update: { eurRub },
        create: { year: YEAR, month, eurRub },
      });
    }
    console.log("  Exchange rates imported");
  }

  // 2. Identify sections by their header rows
  type Section = {
    group: string;
    startMarker: string;
    endMarker: string;
  };

  const sections: Section[] = [
    {
      group: "moscow",
      startMarker: "МОСКВА",
      endMarker: "Итого Москва",
    },
    {
      group: "spain",
      startMarker: "ИСПАНИЯ",
      endMarker: "Итого Испания",
    },
    {
      group: "onetime",
      startMarker: "РАЗОВЫЕ РАСХОДЫ",
      endMarker: "Итого разовые",
    },
  ];

  for (const section of sections) {
    const startIdx = rows.findIndex((r) => r[0]?.includes(section.startMarker));
    const endIdx = rows.findIndex((r) => r[0]?.trim().startsWith(section.endMarker));

    if (startIdx === -1 || endIdx === -1) {
      console.log(`  Warning: section "${section.group}" not found`);
      continue;
    }

    // Rows between start header and end total (exclusive)
    const dataRows = rows.slice(startIdx + 1, endIdx);

    for (const row of dataRows) {
      const category = row[0]?.trim();
      // Skip empty rows and the computed RUB equivalent row for Spain
      if (!category || category === "" || category.startsWith("Жизнь в Испании (₽")) {
        continue;
      }

      const currency = row[1]?.trim();
      const isEuro = currency === "€";

      for (let col = MONTH_COLUMNS_START; col <= 12; col++) {
        const month = col;
        const amount = getMonthValue(row, col);

        await prisma.expenseEntry.upsert({
          where: {
            year_month_group_category: {
              year: YEAR,
              month,
              group: section.group,
              category: isEuro ? `${category} [EUR]` : category,
            },
          },
          update: { amount },
          create: {
            year: YEAR,
            month,
            group: section.group,
            category: isEuro ? `${category} [EUR]` : category,
            amount,
          },
        });
      }
    }

    console.log(`  ${section.group} expenses imported`);
  }
}

async function main() {
  console.log("Seeding finance data...");

  // 1. Create FinancePerson records
  const nikita = await prisma.financePerson.upsert({
    where: { slug: "nikita" },
    update: {},
    create: { name: "Никита", slug: "nikita" },
  });

  const darya = await prisma.financePerson.upsert({
    where: { slug: "darya" },
    update: {},
    create: { name: "Дарья", slug: "darya" },
  });

  console.log(`  Persons: ${nikita.name}, ${darya.name}`);

  // 2. Import Nikita's income
  await seedNikitaIncome(nikita.id);

  // 3. Import Darya's params and computed income
  await seedDaryaParams(darya.id);

  // 4. Import exchange rates and expenses
  await seedExpenses();

  console.log("Finance seed completed!");
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
