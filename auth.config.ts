import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (no Prisma, no bcrypt).
 * Used by middleware to check authorization without Node.js-only deps.
 */
export default {
  providers: [], // Providers are added in src/lib/auth.ts (Node.js only)
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/calendar", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
