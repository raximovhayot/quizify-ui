import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { auth } from '@/components/features/auth/config/next-auth.config';
import { UserState } from '@/components/features/profile/types/account';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session from NextAuth
  const session = await auth();
  const user = session?.user || null;

  // Handle root path redirection
  if (pathname === '/') {
    if (!user || !session) {
      // Not authenticated, redirect to sign-in
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // User is authenticated, redirect based on roles
    const userRoles = user.roles || [];
    const hasStudentRole = userRoles.some((role) => role.name === 'STUDENT');
    const hasInstructorRole = userRoles.some(
      (role) => role.name === 'INSTRUCTOR'
    );

    if (hasStudentRole && hasInstructorRole) {
      // User has both roles, redirect to student dashboard as default
      return NextResponse.redirect(new URL('/student', request.url));
    } else if (hasStudentRole) {
      return NextResponse.redirect(new URL('/student', request.url));
    } else if (hasInstructorRole) {
      return NextResponse.redirect(new URL('/instructor', request.url));
    } else {
      // No valid roles, redirect to sign-in
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  // Define route patterns and their required roles
  const routeConfig = {
    '/student': ['STUDENT'],
    '/instructor': ['INSTRUCTOR'],
    '/join': [], // Join page accessible to all
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
    signInUrl.searchParams.set('redirect', pathname);
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
    // Log authorization failure
    import('@/lib/security-logger').then(({ logRoleMismatch }) => {
      logRoleMismatch(
        user.id,
        userRoles.map((r) => r.name),
        requiredRoles
      );
    });

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
