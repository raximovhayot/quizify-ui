import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { auth } from '@/features/auth/config/next-auth.config';
import { UserState } from '@/features/profile/types/account';
import { pickDashboard } from '@/lib/auth/dashboardUtils';
import { sanitizeRedirect } from '@/lib/auth/redirectUtils';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session from NextAuth
  const session = await auth();
  const user = session?.user || null;

  // Redirect signed-in users away from public entry points
  if (pathname === '/sign-in' || pathname === '/join') {
    if (session && user) {
      const dash = pickDashboard(user);
      if (dash) {
        return NextResponse.redirect(new URL(dash, request.url));
      }
    }
    return NextResponse.next();
  }

  // Handle root path redirection
  if (pathname === '/') {
    if (!user || !session) {
      // Not authenticated, redirect to sign-in
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const dash = pickDashboard(user);
    if (dash) {
      return NextResponse.redirect(new URL(dash, request.url));
    }
    // Fallback when user has no valid roles
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Define route patterns and their required roles
  const routeConfig = {
    '/student': ['STUDENT'],
    '/instructor': ['INSTRUCTOR'],
    '/sign-in': [], // Sign-in page accessible to all
  };

  // Check if the current path requires authentication
  const getRequiredRoles = (path: string): string[] => {
    for (const [route, roles] of Object.entries(routeConfig)) {
      if (path.startsWith(route)) {
        return roles;
      }
    }
    return [];
  };

  const requiredRoles = getRequiredRoles(pathname);

  // If no roles required, allow access
  if (requiredRoles.length === 0) {
    return NextResponse.next();
  }

  // If roles required but user not authenticated, redirect to sign-in
  if (!user || !session) {
    const signInUrl = new URL('/sign-in', request.url);
    const safe = sanitizeRedirect(pathname);
    if (safe) {
      signInUrl.searchParams.set('redirect', safe);
    }
    return NextResponse.redirect(signInUrl);
  }

  // If user is authenticated but has NEW state, redirect to profile completion
  // Exclude profile completion page itself to avoid infinite redirect loop
  if (
    user &&
    user.state === UserState.NEW &&
    !pathname.startsWith('/profile/complete')
  ) {
    return NextResponse.redirect(new URL('/profile/complete', request.url));
  }

  // Check if user has required roles
  const userRoles = user.roles || [];
  const hasRequiredRole = requiredRoles.some((role: string) =>
    userRoles.some((userRole) => userRole.name === role)
  );

  if (!hasRequiredRole) {
    // Redirect based on user's roles
    const hasStudentRole = userRoles.some((role) => role.name === 'STUDENT');
    const hasInstructorRole = userRoles.some(
      (role) => role.name === 'INSTRUCTOR'
    );

    if (hasStudentRole && hasInstructorRole) {
      // User has both roles, redirect to a role selection page or default
      return NextResponse.redirect(new URL('/', request.url));
    } else if (hasStudentRole) {
      return NextResponse.redirect(new URL('/student', request.url));
    } else if (hasInstructorRole) {
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
    '/student/:path*',
    '/instructor/:path*',
    '/profile/:path*',
    '/sign-in',
    '/',
  ],
};
