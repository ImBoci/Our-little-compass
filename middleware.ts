import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
    const isOnboarding = pathname.startsWith('/onboarding');
    const isPublic = pathname.startsWith('/api') || pathname.startsWith('/manifest') || pathname.startsWith('/favicon') || pathname.startsWith('/models');

    // If no token and trying to access a protected route
    if (!token && !isAuthRoute && !isPublic) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (token) {
      // If user is authenticated but has no coupleId, force them to onboarding
      if (!token.coupleId && !isOnboarding && !isAuthRoute && !isPublic) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }

      // If user is authenticated and HAS a coupleId, don't let them go to onboarding or login
      if (token.coupleId && (isOnboarding || isAuthRoute)) {
         return NextResponse.redirect(new URL('/', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: () => true // We handle authorization manually above
    }
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
