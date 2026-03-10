import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteContext = { params: Promise<any> };

type AuthenticatedHandler = (
  request: Request,
  session: Session,
  context?: RouteContext
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (request: Request, context?: RouteContext): Promise<NextResponse> => {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(request, session, context);
  };
}

export function withAdmin(handler: AuthenticatedHandler) {
  return async (request: Request, context?: RouteContext): Promise<NextResponse> => {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(request, session, context);
  };
}
