import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protect club owner routes
    if (path.startsWith('/business') && !token?.isClubOwner) {
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
    }

    // Protect check-in routes
    if (path.startsWith('/checkin') && !token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: [
    '/business/:path*', 
    '/checkin/:path*',
    '/profile/:path*'
  ]
};
