import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateTaskSchema, moveTaskSchema } from "@/lib/validations/task";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: true,
        assignee: true,
        phase: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch task");
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
});

export const PUT = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = updateTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    const updateData: Record<string, unknown> = { ...data };

    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }

    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    if (data.phaseId === null) {
      updateData.phaseId = null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        createdBy: true,
        assignee: true,
        phase: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    logger.error({ err: error }, "Failed to update task");
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
});

export const PATCH = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = moveTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.position !== undefined && { position: data.position }),
      },
      include: {
        category: true,
        createdBy: true,
        assignee: true,
        phase: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    logger.error({ err: error }, "Failed to move task");
    return NextResponse.json({ error: "Failed to move task" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    logger.error({ err: error }, "Failed to delete task");
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
});
