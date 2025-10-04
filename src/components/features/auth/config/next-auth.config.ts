import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';

import { AuthService } from '@/components/features/auth/services/authService';
import {
  AccountDTO,
  UserState,
} from '@/components/features/profile/types/account';

// Override NextAuth types to completely replace AdapterUser requirements
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      phone: string;
      firstName?: string;
      lastName?: string;
      state: UserState;
      roles: Array<{ id: number; name: string }>;
      dashboardType?: string;
      language: string;
    };
    accessToken: string;
    refreshToken: string;
  }

  interface User {
    id: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    state: UserState;
    roles: Array<{ id: number; name: string }>;
    dashboardType?: string;
    language: string;
    accessToken: string;
    refreshToken: string;
  }
}

// AdapterUser augmentation removed to avoid referencing non-existent module during type checks

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    user: AccountDTO;
    accessTokenExpires: number;
    error?: string;
  }
}

function base64UrlDecode(input: string): string {
  const mod = input.length % 4;
  const pad = mod === 2 ? '==' : mod === 3 ? '=' : mod === 1 ? '===' : '';
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(base64, 'base64').toString('utf8');
}

function getJwtExpirationMs(jwt: string | null | undefined): number | null {
  if (!jwt) return null;
  try {
    const parts = jwt.split('.');
    if (parts.length < 2) return null;
    const payloadStr = base64UrlDecode(parts[1]!);
    const payload = JSON.parse(payloadStr) as { exp?: number };
    if (!payload.exp) return null;
    const skewMs = 30 * 1000; // 30s clock skew safety
    return payload.exp * 1000 - skewMs;
  } catch {
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Phone and Password',
      credentials: {
        phone: {
          label: 'Phone Number',
          type: 'tel',
          placeholder: '+998901234567',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null;
        }

        const phone = credentials.phone as string;

        try {
          const response = await AuthService.signIn(
            phone,
            credentials.password as string
          );

          if (Array.isArray(response.errors) && response.errors.length > 0) {
            return null;
          }

          const jwtToken = response.data;
          if (
            !jwtToken?.accessToken ||
            !jwtToken?.refreshToken ||
            !jwtToken?.user
          ) {
            return null;
          }

          return {
            id: jwtToken.user.id.toString(),
            phone: jwtToken.user.phone,
            firstName: jwtToken.user.firstName,
            lastName: jwtToken.user.lastName,
            state: jwtToken.user.state,
            roles: jwtToken.user.roles || [],
            dashboardType: jwtToken.user.dashboardType?.toString(),
            language: jwtToken.user.language,
            accessToken: jwtToken.accessToken,
            refreshToken: jwtToken.refreshToken,
          };
        } catch (_e) {
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      // Initial sign in
      if (user) {
        const computedExp =
          getJwtExpirationMs(user.accessToken) ?? Date.now() + 15 * 60 * 1000; // fallback 15 minutes
        return {
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          user: {
            id: parseInt(user.id),
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            roles: user.roles,
            phone: user.phone,
            state: user.state,
            language: user.language,
            dashboardType: user.dashboardType?.toString(),
          },
          accessTokenExpires: computedExp,
        } as JWT;
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.user.id.toString(),
          phone: token.user.phone,
          firstName: token.user.firstName,
          lastName: token.user.lastName,
          state: token.user.state,
          roles: token.user.roles,
          dashboardType: token.user.dashboardType?.toString(),
          language: token.user.language,
        } as unknown as typeof session.user;
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
      }
      return session;
    },
  },

  pages: {
    signIn: '/sign-in',
    error: '/auth/error',
  },

  events: {
    async signOut(_message) {
      // Monitoring/logging removed: no external side effects on sign-out.
    },
  },
});

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const refreshedTokens = await AuthService.refreshToken(token.refreshToken);
    const newAccess = refreshedTokens?.data?.accessToken;
    const newRefresh = refreshedTokens?.data?.refreshToken;
    if (!newAccess || !newRefresh) {
      throw new Error('Invalid refresh token response');
    }
    const computedExp =
      getJwtExpirationMs(newAccess) ?? Date.now() + 15 * 60 * 1000; // fallback 15 minutes

    // Token refresh successful

    return {
      ...token,
      accessToken: newAccess,
      refreshToken: newRefresh,
      accessTokenExpires: computedExp,
    } as JWT;
  } catch (_error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    } as JWT;
  }
}
