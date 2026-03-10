import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createCategorySchema } from "@/lib/validations/category";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async (request, session) => {
  try {
    const categories = await prisma.category.findMany({
      where: { familyId: session.user.familyId },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch categories");
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
});

export const POST = withAuth(async (request, session) => {
  try {
    const body = await request.json();
    const result = createCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { ...result.data, familyId: session.user.familyId },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Failed to create category");
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
});
