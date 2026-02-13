import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const taskTypes = [
  {
    key: "documents",
    label: "Документы / подготовка",
    color: "#3b82f6",
    position: 0,
  },
  {
    key: "travel",
    label: "Путешествия / перелёты",
    color: "#f59e0b",
    position: 1,
  },
  {
    key: "consultation",
    label: "Консультация / юрист",
    color: "#8b5cf6",
    position: 2,
  },
  {
    key: "visa",
    label: "Визы / ВНЖ / ожидание",
    color: "#6366f1",
    position: 3,
  },
  {
    key: "relocation",
    label: "Переезд / обустройство",
    color: "#ef4444",
    position: 4,
  },
  {
    key: "living",
    label: "Жизнь в стране / работа",
    color: "#10b981",
    position: 5,
  },
  {
    key: "child",
    label: "Ребёнок / роды",
    color: "#ec4899",
    position: 6,
  },
  {
    key: "citizenship",
    label: "Гражданство",
    color: "#f97316",
    position: 7,
  },
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
    tasks: [
      {
        name: "Шенгенская виза",
        details: "Для поездки-разведки",
        taskType: "visa",
        start: monthStart(2026, 2),
        end: monthEnd(2026, 3),
        position: 0,
      },
      {
        name: "Разведка Европы (15 дней)",
        details: "Барселона→Валенсия→Малага→Порту→Лиссабон",
        taskType: "travel",
        start: monthStart(2026, 4),
        end: monthEnd(2026, 4),
        position: 1,
      },
      {
        name: "Консультация + «под ключ»",
        details: "Иммиграционный юрист, за 4 мес до переезда",
        taskType: "consultation",
        start: monthStart(2026, 5),
        end: monthEnd(2026, 5),
        position: 2,
      },
      {
        name: "Сбор документов",
        details: "Несудимость за 2 года, апостили, переводы...",
        taskType: "documents",
        start: monthStart(2026, 5),
        end: monthEnd(2026, 8),
        position: 3,
      },
      {
        name: "Шенгенская виза",
        details: "Подача и получение шенгена для въезда в Испанию",
        taskType: "visa",
        start: monthStart(2026, 8),
        end: monthEnd(2026, 9),
        position: 4,
      },
      {
        name: "Переезд в Валенсию",
        details: "Въезд по шенгену как турист",
        taskType: "relocation",
        start: monthStart(2026, 10),
        end: monthEnd(2026, 10),
        position: 5,
      },
      {
        name: "Подача на DN ВНЖ из Испании",
        details: "UGE-CE онлайн, жена как cónyuge",
        taskType: "visa",
        start: monthStart(2026, 10),
        end: monthEnd(2026, 11),
        position: 6,
      },
      {
        name: "Одобрение ВНЖ (3 года)",
        details: "Обработка ~20 рабочих дней",
        taskType: "visa",
        start: monthStart(2026, 11),
        end: monthEnd(2026, 12),
        position: 7,
      },
      {
        name: "TIE (карточка резидента)",
        details: "Отпечатки в полиции → карточка через 30-40 дней",
        taskType: "visa",
        start: monthStart(2026, 12),
        end: quarterEnd(2027, 1),
        position: 8,
      },
      {
        name: "Обустройство",
        details: "Жильё, банк, регистрация Beckham Law",
        taskType: "relocation",
        start: monthStart(2026, 10),
        end: monthEnd(2026, 12),
        position: 9,
      },
      {
        name: "✈️ Москва: Новый год 2026-2027",
        details: null,
        taskType: "travel",
        start: monthStart(2026, 12),
        end: monthEnd(2026, 12),
        position: 10,
      },
      {
        name: "Собачка",
        details: "Переезд Бруно к нам",
        taskType: "relocation",
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
    tasks: [
      {
        name: "Удалённая работа + интеграция",
        details: null,
        taskType: "living",
        start: quarterStart(2027, 1),
        end: quarterEnd(2027, 4),
        position: 0,
      },
      {
        name: "✈️ Москва: всё лето 2027",
        details: null,
        taskType: "travel",
        start: quarterStart(2027, 2),
        end: quarterEnd(2027, 3),
        position: 1,
      },
      {
        name: "Продление ВНЖ (если нужно)",
        details: "Изначально 3 года → до осени 2029",
        taskType: "visa",
        start: quarterStart(2027, 3),
        end: quarterEnd(2027, 3),
        position: 2,
      },
      {
        name: "Учить португальский",
        details: "Подготовка к Бразилии",
        taskType: "documents",
        start: quarterStart(2028, 1),
        end: quarterEnd(2028, 2),
        position: 3,
      },
      {
        name: "Подготовка к родам в Бразилии",
        details: "Выбор клиники, логистика",
        taskType: "child",
        start: quarterStart(2028, 2),
        end: quarterEnd(2028, 3),
        position: 4,
      },
      {
        name: "✈️ Москва: перед Бразилией",
        details: null,
        taskType: "travel",
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
    tasks: [
      {
        name: "Зачатие",
        details: "Планирование для родов ~июнь 2029",
        taskType: "child",
        start: quarterStart(2028, 4),
        end: quarterEnd(2028, 4),
        position: 0,
      },
      {
        name: "Прививка от жёлтой лихорадки",
        details: "За 10+ дней до вылета",
        taskType: "documents",
        start: quarterStart(2029, 1),
        end: quarterEnd(2029, 1),
        position: 1,
      },
      {
        name: "Перелёт в Бразилию",
        details: "Безвизовый въезд, ~7 мес беременности",
        taskType: "travel",
        start: quarterStart(2029, 1),
        end: quarterEnd(2029, 1),
        position: 2,
      },
      {
        name: "Роды",
        details: "Флорианополис, ребёнок = гражданин BR",
        taskType: "child",
        start: quarterStart(2029, 2),
        end: quarterEnd(2029, 2),
        position: 3,
      },
      {
        name: "Документы ребёнка",
        details: "Cartório → свидетельство → CPF → паспорт BR",
        taskType: "documents",
        start: quarterStart(2029, 2),
        end: quarterEnd(2029, 3),
        position: 4,
      },
      {
        name: "Продление пребывания",
        details: "Продлить на +90 дней в Федеральной полиции",
        taskType: "visa",
        start: quarterStart(2029, 3),
        end: quarterEnd(2029, 3),
        position: 5,
      },
      {
        name: "✈️ Москва: знакомство с бабушками",
        details: null,
        taskType: "travel",
        start: quarterStart(2029, 4),
        end: quarterEnd(2029, 4),
        position: 6,
      },
      {
        name: "ПМЖ родителей (VIPER)",
        details: "Подача в Фед. полицию через ребёнка-гражданина",
        taskType: "visa",
        start: quarterStart(2029, 4),
        end: quarterEnd(2030, 1),
        position: 7,
      },
      {
        name: "Жизнь в Бразилии (1 год ПМЖ)",
        details: "Обязательный год для натурализации",
        taskType: "living",
        start: quarterStart(2030, 1),
        end: quarterEnd(2030, 4),
        position: 8,
      },
      {
        name: "Подача на гражданство BR",
        details: "Платформа Naturalizar-se, после 1 года ПМЖ",
        taskType: "citizenship",
        start: quarterStart(2031, 1),
        end: quarterEnd(2031, 1),
        position: 9,
      },
      {
        name: "Получение гражданства BR 🇧🇷",
        details: "Обработка ~6 мес",
        taskType: "citizenship",
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
    tasks: [
      {
        name: "Возвращение в Испанию",
        details: "Новый ВНЖ как граждане Бразилии",
        taskType: "relocation",
        start: quarterStart(2031, 4),
        end: quarterEnd(2031, 4),
        position: 0,
      },
      {
        name: "Резидентство — год 1",
        details: "Непрерывное проживание, макс 3 мес отсутствия",
        taskType: "living",
        start: quarterStart(2032, 1),
        end: quarterEnd(2032, 4),
        position: 1,
      },
      {
        name: "Резидентство — год 2",
        details: "Подготовка к CCSE",
        taskType: "living",
        start: quarterStart(2033, 1),
        end: quarterEnd(2033, 4),
        position: 2,
      },
      {
        name: "Зачатие (ребёнок №2)",
        details: "Планирование для родов конец 2032",
        taskType: "child",
        start: quarterStart(2032, 2),
        end: quarterEnd(2032, 2),
        position: 3,
      },
      {
        name: "Роды в Испании (ребёнок №2)",
        details: null,
        taskType: "child",
        start: quarterStart(2032, 4),
        end: quarterEnd(2032, 4),
        position: 4,
      },
      {
        name: "Гражданство ES для ребёнка №2",
        details: "Рождён в Испании → гражданство после 1 года",
        taskType: "citizenship",
        start: quarterStart(2033, 4),
        end: quarterEnd(2033, 4),
        position: 5,
      },
      {
        name: "Подача на гражданство ES",
        details: "Registro Civil, после 2 лет резидентства",
        taskType: "citizenship",
        start: quarterStart(2034, 1),
        end: quarterEnd(2034, 1),
        position: 6,
      },
      {
        name: "Ожидание решения",
        details: "Обработка 1-2 года",
        taskType: "citizenship",
        start: quarterStart(2034, 2),
        end: quarterEnd(2035, 1),
        position: 7,
      },
      {
        name: "Гражданство Испании 🇪🇸🇪🇺",
        details: "Присяга, паспорт ЕС для всей семьи",
        taskType: "citizenship",
        start: quarterStart(2035, 2),
        end: quarterEnd(2035, 2),
        position: 8,
      },
    ],
  },
];

async function main() {
  // Seed task types via upsert
  for (const tt of taskTypes) {
    await prisma.roadmapTaskType.upsert({
      where: { key: tt.key },
      update: { label: tt.label, color: tt.color, position: tt.position },
      create: tt,
    });
  }
  console.log(`Task types: ${taskTypes.length}`);

  // Delete existing phases and tasks (to allow re-running)
  await prisma.roadmapTask.deleteMany();
  await prisma.roadmapPhase.deleteMany();

  // Create phases with tasks
  for (const phaseData of phases) {
    const phase = await prisma.roadmapPhase.create({
      data: {
        name: phaseData.name,
        emoji: phaseData.emoji,
        position: phaseData.position,
        tasks: {
          create: phaseData.tasks.map((t) => ({
            name: t.name,
            details: t.details,
            taskType: t.taskType,
            startDate: t.start,
            endDate: t.end,
            position: t.position,
          })),
        },
      },
    });
    console.log(`Phase: ${phase.name} (${phaseData.tasks.length} tasks)`);
  }

  const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
  console.log(`\nTotal: ${phases.length} phases, ${totalTasks} tasks`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
