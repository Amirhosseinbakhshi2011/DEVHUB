import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public routes
        const publicPaths = ["/", "/login", "/register"];
        if (publicPaths.includes(path)) return true;

        // API auth routes are public
        if (path.startsWith("/api/auth")) return true;

        // Everything else under these prefixes needs auth
        const protectedPrefixes = [
          "/feed",
          "/settings",
          "/onboarding",
          "/notifications",
          "/jobs/new",
          "/questions/ask",
        ];

        const needsAuth = protectedPrefixes.some((p) => path.startsWith(p));
        if (needsAuth) {
          return !!token;
        }

        // Other pages (questions list, job list, profiles) can be public for now
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image, favicon, public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
