import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { upsertExchangeRateSchema } from "@/lib/validations/finance";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  if (!year) {
    return NextResponse.json({ error: "Параметр year обязателен" }, { status: 400 });
  }

  try {
    const rates = await prisma.exchangeRate.findMany({
      where: {
        year: parseInt(year, 10),
      },
      orderBy: { month: "asc" },
    });

    return NextResponse.json(rates);
  } catch (error) {
    logger.error({ err: error }, "Не удалось получить курсы валют");
    return NextResponse.json({ error: "Не удалось получить курсы валют" }, { status: 500 });
  }
});

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json();
    const result = upsertExchangeRateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { year, month, eurRub } = result.data;

    const rate = await prisma.exchangeRate.upsert({
      where: {
        year_month: { year, month },
      },
      update: { eurRub },
      create: { year, month, eurRub },
    });

    return NextResponse.json(rate);
  } catch (error) {
    logger.error({ err: error }, "Не удалось сохранить курс валюты");
    return NextResponse.json({ error: "Не удалось сохранить курс валюты" }, { status: 500 });
  }
});
