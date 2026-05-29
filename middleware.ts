import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
    const isOnboarding = pathname.startsWith('/onboarding');
    const isPublic = pathname.startsWith('/api') || pathname.startsWith('/manifest') || pathname.startsWith('/favicon') || pathname.startsWith('/models');

    // /api/auth is needed for NextAuth
    const isNextAuth = pathname.startsWith('/api/auth');

    // If user is logged in
    if (token) {
      // User without space must go to onboarding
      if (!token.coupleId && !isOnboarding && !isAuthRoute && !isPublic) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }

      // User with space cannot go to auth or onboarding routes
      if (token.coupleId && (isOnboarding || isAuthRoute)) {
         return NextResponse.redirect(new URL('/', req.url));
      }
    }
    
    return NextResponse.next();
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
