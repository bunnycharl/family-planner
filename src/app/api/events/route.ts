import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createEventSchema } from "@/lib/validations/event";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async (request, session) => {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const categoryId = searchParams.get("categoryId");
  const createdById = searchParams.get("createdById");

  const where: Record<string, unknown> = {
    familyId: session.user.familyId,
  };

  if (start || end) {
    where.date = {};
    if (start) {
      (where.date as Record<string, unknown>).gte = new Date(start);
    }
    if (end) {
      (where.date as Record<string, unknown>).lte = new Date(end);
    }
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (createdById) {
    where.createdById = createdById;
  }

  try {
    const events = await prisma.event.findMany({
      where,
      include: {
        category: true,
        createdBy: true,
        assignee: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch events");
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
});

export const POST = withAuth(async (request, session) => {
  try {
    const body = await request.json();
    const result = createEventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    const event = await prisma.event.create({
      data: {
        ...data,
        date: new Date(data.date),
        createdById: session.user!.id!,
        familyId: session.user.familyId,
      },
      include: {
        category: true,
        createdBy: true,
        assignee: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Failed to create event");
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
});
