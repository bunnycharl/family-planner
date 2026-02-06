import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const GET = withAuth(async () => {
  try {
    const users = await prisma.user.findMany({
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
