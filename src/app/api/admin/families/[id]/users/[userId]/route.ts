import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { z } from "zod";
import bcrypt from "bcryptjs";

const changePasswordSchema = z.object({
  password: z.string().min(1).max(100),
});

export const PATCH = withAdmin(async (request, _session, context) => {
  const { id: familyId, userId } = await context!.params;

  try {
    const user = await prisma.user.findFirst({ where: { id: userId, familyId } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    if (user.isAdmin) {
      return NextResponse.json({ error: "Нельзя изменить пароль администратора" }, { status: 403 });
    }

    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(result.data.password, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, "Не удалось изменить пароль пользователя");
    return NextResponse.json({ error: "Не удалось изменить пароль" }, { status: 500 });
  }
});

export const DELETE = withAdmin(async (_request, _session, context) => {
  const { id: familyId, userId } = await context!.params;

  try {
    const user = await prisma.user.findFirst({ where: { id: userId, familyId } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    if (user.isAdmin) {
      return NextResponse.json({ error: "Нельзя удалить администратора" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить пользователя");
    return NextResponse.json({ error: "Не удалось удалить пользователя" }, { status: 500 });
  }
});
