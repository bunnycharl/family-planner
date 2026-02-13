import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateMemberSchema } from "@/lib/finances/validations";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = updateMemberSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", issues: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.familyMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Член семьи не найден" }, { status: 404 });
    }

    const member = await prisma.familyMember.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(member);
  } catch (error) {
    logger.error({ err: error }, "Не удалось обновить члена семьи");
    return NextResponse.json({ error: "Не удалось обновить члена семьи" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const existing = await prisma.familyMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Член семьи не найден" }, { status: 404 });
    }

    await prisma.familyMember.delete({ where: { id } });

    return NextResponse.json({ message: "Член семьи удалён" });
  } catch (error) {
    logger.error({ err: error }, "Не удалось удалить члена семьи");
    return NextResponse.json({ error: "Не удалось удалить члена семьи" }, { status: 500 });
  }
});
