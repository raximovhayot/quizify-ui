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

        const response = await AuthService.signIn(
          credentials.phone as string,
          credentials.password as string
        );

        if (response.errors) {
        }

        const jwtToken = response.data;
        return {
          id: jwtToken.user.id.toString(),
          phone: jwtToken.user.phone,
          firstName: jwtToken.user.firstName,
          lastName: jwtToken.user.lastName,
          state: jwtToken.user.state,
          roles: jwtToken.user.roles || [],
          dashboardType: jwtToken.user.dashboardType?.toString(),
          accessToken: jwtToken.accessToken,
          refreshToken: jwtToken.refreshToken,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    async jwt({ token, user, account }): Promise<JWT> {
      // Initial sign in
      if (account && user) {
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
            language: 'en' as const,
            dashboardType: user.dashboardType?.toString(),
          },
          accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 minutes
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
    async signOut() {
      // Clean up any additional logout logic if needed
    },
  },
});

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(token: JWT) {
  try {
    const refreshedTokens = await AuthService.refreshToken(token.refreshToken);

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
