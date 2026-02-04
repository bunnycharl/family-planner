import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createEventSchema } from "@/lib/validations/event";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const categoryId = searchParams.get("categoryId");
  const createdById = searchParams.get("createdById");

  const where: Record<string, unknown> = {};

  if (start || end) {
    where.startDate = {};
    if (start) {
      (where.startDate as Record<string, unknown>).gte = new Date(start);
    }
    if (end) {
      (where.startDate as Record<string, unknown>).lte = new Date(end);
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
        modifiedBy: true,
        assignees: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = createEventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { assigneeIds, ...data } = result.data;

    const event = await prisma.event.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        createdById: session.user.id!,
        assignees: assigneeIds
          ? { connect: assigneeIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        category: true,
        createdBy: true,
        modifiedBy: true,
        assignees: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
