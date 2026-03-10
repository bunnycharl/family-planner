import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  avatarColor: z.string().optional(),
});

export const GET = withAuth(async (request, session) => {
  try {
    const users = await prisma.user.findMany({
      where: { familyId: session.user.familyId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarColor: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch users");
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
});

export const POST = withAuth(async (request, session) => {
  try {
    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password, avatarColor } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        avatarColor: avatarColor ?? "#6366f1",
        familyId: session.user.familyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarColor: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Failed to create user");
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
});
