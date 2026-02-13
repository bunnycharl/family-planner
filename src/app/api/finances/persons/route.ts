import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async () => {
  try {
    const persons = await prisma.financePerson.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(persons);
  } catch (error) {
    logger.error({ err: error }, "Не удалось получить список финансовых персон");
    return NextResponse.json({ error: "Не удалось получить список персон" }, { status: 500 });
  }
});
