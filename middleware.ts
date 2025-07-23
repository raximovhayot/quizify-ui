import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserState } from '@/types/common';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Since we don't use locale-based routing anymore, use pathname directly
  const actualPathname = pathname;

  // Get user data and access token from cookies (in a real app, you'd validate JWT tokens)
  const userCookie = request.cookies.get('user');
  const accessTokenCookie = request.cookies.get('accessToken');
  let user = null;

  if (userCookie) {
    try {
      user = JSON.parse(userCookie.value);
    } catch (error) {
      console.error('Error parsing user cookie:', error);
    }
  }

  // Define route patterns and their required roles
  const routeConfig = {
    '/student': ['STUDENT'],
    '/instructor': ['INSTRUCTOR'],
    '/join': [], // Join page accessible to all
    '/sign-in': [], // Sign-in page accessible to all
    '/': [] // Default page accessible to all
  };

  // Check if the current path requires authentication
  const getRequiredRoles = (path: string): string[] => {
    for (const [route, roles] of Object.entries(routeConfig)) {
      if (path.startsWith(route) && route !== '/') {
        return roles;
      }
    }
    return routeConfig['/'] || [];
  };

  const requiredRoles = getRequiredRoles(actualPathname);

  // If no roles required, allow access
  if (requiredRoles.length === 0) {
    return NextResponse.next();
  }

  // If roles required but user not authenticated, redirect to sign-in
  if (!user || !accessTokenCookie) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is authenticated but has NEW state, redirect to complete profile
  // Exclude sign-up page itself to avoid infinite redirect loop
  if (user && user.state === UserState.NEW && !actualPathname.startsWith('/sign-up')) {
    return NextResponse.redirect(new URL('/sign-up', request.url));
  }

  // Check if user has required roles
  const userRoles = user.roles || [];
  const hasRequiredRole = requiredRoles.some((role: string) => userRoles.includes(role));

  if (!hasRequiredRole) {
    // Redirect based on user's roles without locale prefix
    if (userRoles.includes('STUDENT') && userRoles.includes('INSTRUCTOR')) {
      // User has both roles, redirect to a role selection page or default
      return NextResponse.redirect(new URL('/', request.url));
    } else if (userRoles.includes('STUDENT')) {
      return NextResponse.redirect(new URL('/student', request.url));
    } else if (userRoles.includes('INSTRUCTOR')) {
      return NextResponse.redirect(new URL('/instructor', request.url));
    } else {
      // No valid roles, redirect to sign-in
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
