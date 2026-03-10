import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  avatarColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .default("#6366f1"),
});

export const POST = withAdmin(async (request, _session, context) => {
  const { id: familyId } = await context!.params;

  try {
    const family = await prisma.family.findUnique({ where: { id: familyId } });
    if (!family) {
      return NextResponse.json({ error: "Семья не найдена" }, { status: 404 });
    }

    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email: result.data.email } });
    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(result.data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        hashedPassword,
        avatarColor: result.data.avatarColor,
        familyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarColor: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Не удалось создать пользователя");
    return NextResponse.json({ error: "Не удалось создать пользователя" }, { status: 500 });
  }
});
