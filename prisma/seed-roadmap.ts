import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// These will be created as Categories (shared with events/tasks)
const milestoneCategories = [
  { name: "Документы / подготовка", color: "#3b82f6" },
  { name: "Путешествия / перелёты", color: "#f59e0b" },
  { name: "Консультация / юрист", color: "#8b5cf6" },
  { name: "Визы / ВНЖ / ожидание", color: "#6366f1" },
  { name: "Переезд / обустройство", color: "#ef4444" },
  { name: "Жизнь в стране / работа", color: "#10b981" },
  { name: "Ребёнок / роды", color: "#ec4899" },
  { name: "Гражданство", color: "#f97316" },
];

// Helper functions for date ranges
function quarterStart(year: number, quarter: number): Date {
  return new Date(year, (quarter - 1) * 3, 1);
}

function quarterEnd(year: number, quarter: number): Date {
  const month = quarter * 3;
  return new Date(year, month, 0); // last day of quarter's last month
}

function monthStart(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}

function monthEnd(year: number, month: number): Date {
  return new Date(year, month, 0);
}

const phases = [
  {
    name: "🇪🇸 ПОДГОТОВКА К ПЕРЕЕЗДУ",
    emoji: "🇪🇸",
    position: 0,
    milestones: [
      {
        name: "Шенгенская виза",
        details: "Для поездки-разведки",
        categoryName: "Визы / ВНЖ / ожидание",
        start: monthStart(2026, 2),
        end: monthEnd(2026, 3),
        position: 0,
      },
      {
        name: "Разведка Европы (15 дней)",
        details: "Барселона→Валенсия→Малага→Порту→Лиссабон",
        categoryName: "Путешествия / перелёты",
        start: monthStart(2026, 4),
        end: monthEnd(2026, 4),
        position: 1,
      },
      {
        name: "Консультация + «под ключ»",
        details: "Иммиграционный юрист, за 4 мес до переезда",
        categoryName: "Консультация / юрист",
        start: monthStart(2026, 5),
        end: monthEnd(2026, 5),
        position: 2,
      },
      {
        name: "Сбор документов",
        details: "Несудимость за 2 года, апостили, переводы...",
        categoryName: "Документы / подготовка",
        start: monthStart(2026, 5),
        end: monthEnd(2026, 8),
        position: 3,
      },
      {
        name: "Шенгенская виза",
        details: "Подача и получение шенгена для въезда в Испанию",
        categoryName: "Визы / ВНЖ / ожидание",
        start: monthStart(2026, 8),
        end: monthEnd(2026, 9),
        position: 4,
      },
      {
        name: "Переезд в Валенсию",
        details: "Въезд по шенгену как турист",
        categoryName: "Переезд / обустройство",
        start: monthStart(2026, 10),
        end: monthEnd(2026, 10),
        position: 5,
      },
      {
        name: "Подача на DN ВНЖ из Испании",
        details: "UGE-CE онлайн, жена как cónyuge",
        categoryName: "Визы / ВНЖ / ожидание",
        start: monthStart(2026, 10),
        end: monthEnd(2026, 11),
        position: 6,
      },
      {
        name: "Одобрение ВНЖ (3 года)",
        details: "Обработка ~20 рабочих дней",
        categoryName: "Визы / ВНЖ / ожидание",
        start: monthStart(2026, 11),
        end: monthEnd(2026, 12),
        position: 7,
      },
      {
        name: "TIE (карточка резидента)",
        details: "Отпечатки в полиции → карточка через 30-40 дней",
        categoryName: "Визы / ВНЖ / ожидание",
        start: monthStart(2026, 12),
        end: quarterEnd(2027, 1),
        position: 8,
      },
      {
        name: "Обустройство",
        details: "Жильё, банк, регистрация Beckham Law",
        categoryName: "Переезд / обустройство",
        start: monthStart(2026, 10),
        end: monthEnd(2026, 12),
        position: 9,
      },
      {
        name: "✈️ Москва: Новый год 2026-2027",
        details: null,
        categoryName: "Путешествия / перелёты",
        start: monthStart(2026, 12),
        end: monthEnd(2026, 12),
        position: 10,
      },
      {
        name: "Собачка",
        details: "Переезд Бруно к нам",
        categoryName: "Переезд / обустройство",
        start: quarterStart(2027, 1),
        end: quarterEnd(2027, 1),
        position: 11,
      },
    ],
  },
  {
    name: "🇪🇸 ЖИЗНЬ В ИСПАНИИ",
    emoji: "🇪🇸",
    position: 1,
    milestones: [
      {
        name: "Удалённая работа + интеграция",
        details: null,
        categoryName: "Жизнь в стране / работа",
        start: quarterStart(2027, 1),
        end: quarterEnd(2027, 4),
        position: 0,
      },
      {
        name: "✈️ Москва: всё лето 2027",
        details: null,
        categoryName: "Путешествия / перелёты",
        start: quarterStart(2027, 2),
        end: quarterEnd(2027, 3),
        position: 1,
      },
      {
        name: "Продление ВНЖ (если нужно)",
        details: "Изначально 3 года → до осени 2029",
        categoryName: "Визы / ВНЖ / ожидание",
        start: quarterStart(2027, 3),
        end: quarterEnd(2027, 3),
        position: 2,
      },
      {
        name: "Учить португальский",
        details: "Подготовка к Бразилии",
        categoryName: "Документы / подготовка",
        start: quarterStart(2028, 1),
        end: quarterEnd(2028, 2),
        position: 3,
      },
      {
        name: "Подготовка к родам в Бразилии",
        details: "Выбор клиники, логистика",
        categoryName: "Ребёнок / роды",
        start: quarterStart(2028, 2),
        end: quarterEnd(2028, 3),
        position: 4,
      },
      {
        name: "✈️ Москва: перед Бразилией",
        details: null,
        categoryName: "Путешествия / перелёты",
        start: quarterStart(2028, 3),
        end: quarterEnd(2028, 3),
        position: 5,
      },
    ],
  },
  {
    name: "🇧🇷 БРАЗИЛИЯ: РОДЫ + ГРАЖДАНСТВО",
    emoji: "🇧🇷",
    position: 2,
    milestones: [
      {
        name: "Зачатие",
        details: "Планирование для родов ~июнь 2029",
        categoryName: "Ребёнок / роды",
        start: quarterStart(2028, 4),
        end: quarterEnd(2028, 4),
        position: 0,
      },
      {
        name: "Прививка от жёлтой лихорадки",
        details: "За 10+ дней до вылета",
        categoryName: "Документы / подготовка",
        start: quarterStart(2029, 1),
        end: quarterEnd(2029, 1),
        position: 1,
      },
      {
        name: "Перелёт в Бразилию",
        details: "Безвизовый въезд, ~7 мес беременности",
        categoryName: "Путешествия / перелёты",
        start: quarterStart(2029, 1),
        end: quarterEnd(2029, 1),
        position: 2,
      },
      {
        name: "Роды",
        details: "Флорианополис, ребёнок = гражданин BR",
        categoryName: "Ребёнок / роды",
        start: quarterStart(2029, 2),
        end: quarterEnd(2029, 2),
        position: 3,
      },
      {
        name: "Документы ребёнка",
        details: "Cartório → свидетельство → CPF → паспорт BR",
        categoryName: "Документы / подготовка",
        start: quarterStart(2029, 2),
        end: quarterEnd(2029, 3),
        position: 4,
      },
      {
        name: "Продление пребывания",
        details: "Продлить на +90 дней в Федеральной полиции",
        categoryName: "Визы / ВНЖ / ожидание",
        start: quarterStart(2029, 3),
        end: quarterEnd(2029, 3),
        position: 5,
      },
      {
        name: "✈️ Москва: знакомство с бабушками",
        details: null,
        categoryName: "Путешествия / перелёты",
        start: quarterStart(2029, 4),
        end: quarterEnd(2029, 4),
        position: 6,
      },
      {
        name: "ПМЖ родителей (VIPER)",
        details: "Подача в Фед. полицию через ребёнка-гражданина",
        categoryName: "Визы / ВНЖ / ожидание",
        start: quarterStart(2029, 4),
        end: quarterEnd(2030, 1),
        position: 7,
      },
      {
        name: "Жизнь в Бразилии (1 год ПМЖ)",
        details: "Обязательный год для натурализации",
        categoryName: "Жизнь в стране / работа",
        start: quarterStart(2030, 1),
        end: quarterEnd(2030, 4),
        position: 8,
      },
      {
        name: "Подача на гражданство BR",
        details: "Платформа Naturalizar-se, после 1 года ПМЖ",
        categoryName: "Гражданство",
        start: quarterStart(2031, 1),
        end: quarterEnd(2031, 1),
        position: 9,
      },
      {
        name: "Получение гражданства BR 🇧🇷",
        details: "Обработка ~6 мес",
        categoryName: "Гражданство",
        start: quarterStart(2031, 2),
        end: quarterEnd(2031, 3),
        position: 10,
      },
    ],
  },
  {
    name: "🇪🇸 ВОЗВРАЩЕНИЕ → ГРАЖДАНСТВО ЕС",
    emoji: "🇪🇸",
    position: 3,
    milestones: [
      {
        name: "Возвращение в Испанию",
        details: "Новый ВНЖ как граждане Бразилии",
        categoryName: "Переезд / обустройство",
        start: quarterStart(2031, 4),
        end: quarterEnd(2031, 4),
        position: 0,
      },
      {
        name: "Резидентство — год 1",
        details: "Непрерывное проживание, макс 3 мес отсутствия",
        categoryName: "Жизнь в стране / работа",
        start: quarterStart(2032, 1),
        end: quarterEnd(2032, 4),
        position: 1,
      },
      {
        name: "Резидентство — год 2",
        details: "Подготовка к CCSE",
        categoryName: "Жизнь в стране / работа",
        start: quarterStart(2033, 1),
        end: quarterEnd(2033, 4),
        position: 2,
      },
      {
        name: "Зачатие (ребёнок №2)",
        details: "Планирование для родов конец 2032",
        categoryName: "Ребёнок / роды",
        start: quarterStart(2032, 2),
        end: quarterEnd(2032, 2),
        position: 3,
      },
      {
        name: "Роды в Испании (ребёнок №2)",
        details: null,
        categoryName: "Ребёнок / роды",
        start: quarterStart(2032, 4),
        end: quarterEnd(2032, 4),
        position: 4,
      },
      {
        name: "Гражданство ES для ребёнка №2",
        details: "Рождён в Испании → гражданство после 1 года",
        categoryName: "Гражданство",
        start: quarterStart(2033, 4),
        end: quarterEnd(2033, 4),
        position: 5,
      },
      {
        name: "Подача на гражданство ES",
        details: "Registro Civil, после 2 лет резидентства",
        categoryName: "Гражданство",
        start: quarterStart(2034, 1),
        end: quarterEnd(2034, 1),
        position: 6,
      },
      {
        name: "Ожидание решения",
        details: "Обработка 1-2 года",
        categoryName: "Гражданство",
        start: quarterStart(2034, 2),
        end: quarterEnd(2035, 1),
        position: 7,
      },
      {
        name: "Гражданство Испании 🇪🇸🇪🇺",
        details: "Присяга, паспорт ЕС для всей семьи",
        categoryName: "Гражданство",
        start: quarterStart(2035, 2),
        end: quarterEnd(2035, 2),
        position: 8,
      },
    ],
  },
];

async function main() {
  // Create categories (upsert to avoid duplicates)
  const categoryMap = new Map<string, string>();
  for (const cat of milestoneCategories) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: { color: cat.color },
      create: { name: cat.name, color: cat.color },
    });
    categoryMap.set(cat.name, created.id);
  }
  console.log(`Categories: ${milestoneCategories.length}`);

  // Delete existing phases and milestones (to allow re-running)
  await prisma.milestone.deleteMany();
  await prisma.roadmapPhase.deleteMany();

  // Create phases with milestones
  for (const phaseData of phases) {
    const phase = await prisma.roadmapPhase.create({
      data: {
        name: phaseData.name,
        emoji: phaseData.emoji,
        position: phaseData.position,
        milestones: {
          create: phaseData.milestones.map((m) => ({
            name: m.name,
            details: m.details,
            categoryId: categoryMap.get(m.categoryName) || null,
            startDate: m.start,
            endDate: m.end,
            position: m.position,
          })),
        },
      },
    });
    console.log(`Phase: ${phase.name} (${phaseData.milestones.length} milestones)`);
  }

  const totalMilestones = phases.reduce((sum, p) => sum + p.milestones.length, 0);
  console.log(`\nTotal: ${phases.length} phases, ${totalMilestones} milestones`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
