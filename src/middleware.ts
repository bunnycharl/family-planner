import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  );
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  // Rate limiting for auth endpoints (5 requests per minute)
  if (pathname.startsWith("/api/auth")) {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = rateLimit(`auth:${ip}`, 5, 60 * 1000);
    if (!success) {
      return addSecurityHeaders(rateLimitResponse());
    }
    // Let NextAuth handle its own routes
    return addSecurityHeaders(NextResponse.next());
  }

  // Rate limiting for other API endpoints (60 requests per minute)
  if (isApiRoute) {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = rateLimit(`api:${ip}`, 60, 60 * 1000);
    if (!success) {
      return addSecurityHeaders(rateLimitResponse());
    }
    // API routes handle their own auth via session checks
    return addSecurityHeaders(NextResponse.next());
  }

  // Page routes: check auth via cookie
  const token =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const isLoggedIn = !!token;
  const isOnLogin = pathname.startsWith("/login");

  if (isOnLogin) {
    if (isLoggedIn) {
      return addSecurityHeaders(NextResponse.redirect(new URL("/calendar", request.url)));
    }
    return addSecurityHeaders(NextResponse.next());
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
