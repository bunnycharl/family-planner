import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { z } from "zod";

const createFamilySchema = z.object({
  name: z.string().min(1).max(100),
});

export const GET = withAdmin(async () => {
  try {
    const families = await prisma.family.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        users: {
          select: { id: true, name: true, email: true, avatarColor: true, isAdmin: true },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { users: true } },
      },
    });
    return NextResponse.json(families);
  } catch (error) {
    logger.error({ err: error }, "Не удалось загрузить семьи");
    return NextResponse.json({ error: "Не удалось загрузить семьи" }, { status: 500 });
  }
});

export const POST = withAdmin(async (request) => {
  try {
    const body = await request.json();
    const result = createFamilySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const family = await prisma.family.create({
      data: { name: result.data.name },
      include: {
        users: { select: { id: true, name: true, email: true, avatarColor: true, isAdmin: true } },
        _count: { select: { users: true } },
      },
    });

    return NextResponse.json(family, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать семью");
    return NextResponse.json({ error: "Не удалось создать семью" }, { status: 500 });
  }
});
