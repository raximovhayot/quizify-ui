import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales } from './src/i18n/config';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract locale from pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Get the actual pathname without locale prefix for route matching
  let actualPathname = pathname;
  let currentLocale = 'en'; // default locale
  
  if (!pathnameIsMissingLocale) {
    const segments = pathname.split('/');
    currentLocale = segments[1] as string;
    actualPathname = '/' + segments.slice(2).join('/');
    if (actualPathname === '/') actualPathname = '/';
  }

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

  // If no roles required, handle internationalization and allow access
  if (requiredRoles.length === 0) {
    return intlMiddleware(request);
  }

  // If roles required but user not authenticated, redirect to sign-in
  if (!user || !accessTokenCookie) {
    const signInUrl = new URL(`/${currentLocale}/sign-in`, request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check if user has required roles
  const userRoles = user.roles || [];
  const hasRequiredRole = requiredRoles.some((role: string) => userRoles.includes(role));

  if (!hasRequiredRole) {
    // Redirect based on user's roles with locale prefix
    if (userRoles.includes('STUDENT') && userRoles.includes('INSTRUCTOR')) {
      // User has both roles, redirect to a role selection page or default
      return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
    } else if (userRoles.includes('STUDENT')) {
      return NextResponse.redirect(new URL(`/${currentLocale}/student`, request.url));
    } else if (userRoles.includes('INSTRUCTOR')) {
      return NextResponse.redirect(new URL(`/${currentLocale}/instructor`, request.url));
    } else {
      // No valid roles, redirect to sign-in
      return NextResponse.redirect(new URL(`/${currentLocale}/sign-in`, request.url));
    }
  }

  return intlMiddleware(request);
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
