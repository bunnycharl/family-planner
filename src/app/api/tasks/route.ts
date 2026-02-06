import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createTaskSchema } from "@/lib/validations/task";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");
  const assigneeId = searchParams.get("assigneeId");
  const dueDateStart = searchParams.get("dueDateStart");
  const dueDateEnd = searchParams.get("dueDateEnd");
  const hasDueDate = searchParams.get("hasDueDate");

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (assigneeId) {
    where.assigneeId = assigneeId;
  }

  if (hasDueDate === "true" || dueDateStart || dueDateEnd) {
    const dueDateFilter: Record<string, unknown> = {};
    if (hasDueDate === "true") {
      dueDateFilter.not = null;
    }
    if (dueDateStart) {
      dueDateFilter.gte = new Date(dueDateStart);
    }
    if (dueDateEnd) {
      dueDateFilter.lte = new Date(dueDateEnd);
    }
    where.dueDate = dueDateFilter;
  }

  try {
    const tasks = await prisma.task.findMany({
      where,
      include: {
        category: true,
        createdBy: true,
        assignee: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch tasks");
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
});

export const POST = withAuth(async (request, session) => {
  try {
    const body = await request.json();
    const result = createTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    const maxPositionResult = await prisma.task.aggregate({
      where: { status: data.status },
      _max: { position: true },
    });

    const position = (maxPositionResult._max.position ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        position,
        createdById: session.user!.id!,
      },
      include: {
        category: true,
        createdBy: true,
        assignee: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Failed to create task");
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
});
