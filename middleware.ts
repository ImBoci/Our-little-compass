import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Public files/assets
  const isPublicAsset = 
    pathname.startsWith("/manifest") || 
    pathname.startsWith("/favicon") || 
    pathname.startsWith("/models") ||
    pathname.startsWith("/sw.js") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".json");

  if (isPublicAsset) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isOnboarding = pathname.startsWith("/onboarding");

  // Allow next-auth API routes to pass through always
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 1. Check Authentication & Redirect Rule A (Unauthenticated)
  if (!token) {
    if (isApiRoute) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!isAuthRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // 2. Redirect Rule B (Authenticated, but No Space)
  const coupleId = (token as any).coupleId;
  if (!coupleId) {
    if (isApiRoute) {
      // Allow API routes needed for onboarding, user management, and register checks
      if (
        pathname.startsWith("/api/couple") || 
        pathname.startsWith("/api/user") ||
        pathname.startsWith("/api/auth")
      ) {
        return NextResponse.next();
      }
      return new NextResponse(JSON.stringify({ error: "No couple space assigned" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!isOnboarding && !isAuthRoute) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    return NextResponse.next();
  }

  // 3. Redirect Rule C (Fully Authenticated)
  if (coupleId) {
    if (isAuthRoute || isOnboarding) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, except for auth routes if needed)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
