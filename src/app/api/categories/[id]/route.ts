import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateCategorySchema } from "@/lib/validations/category";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const PUT = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = updateCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(category);
  } catch (error) {
    logger.error({ err: error }, "Failed to update category");
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    logger.error({ err: error }, "Failed to delete category");
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
});
