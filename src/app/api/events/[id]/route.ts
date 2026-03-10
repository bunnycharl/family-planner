import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateEventSchema } from "@/lib/validations/event";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const event = await prisma.event.findFirst({
      where: { id, familyId: session.user.familyId },
      include: {
        category: true,
        createdBy: true,
        assignee: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch event");
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
});

export const PUT = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const body = await request.json();
    const result = updateEventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    const updateData: Record<string, unknown> = { ...data };

    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const existing = await prisma.event.findFirst({
      where: { id, familyId: session.user.familyId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        createdBy: true,
        assignee: true,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    logger.error({ err: error }, "Failed to update event");
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, session, context) => {
  const { id } = await context!.params;

  try {
    const toDelete = await prisma.event.findFirst({
      where: { id, familyId: session.user.familyId },
    });
    if (!toDelete) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Event deleted" });
  } catch (error) {
    logger.error({ err: error }, "Failed to delete event");
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
});
