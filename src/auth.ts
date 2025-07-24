import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { JWT } from "next-auth/jwt"
import { AuthService } from "@/lib/auth-service"
import { UserState } from "@/types/common"
import { AccountDTO, JWTToken } from "@/types/auth"

// Extend NextAuth types to include our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      phone: string
      firstName?: string
      lastName?: string
      state: UserState
      roles: Array<{ id: number; name: string }>
      dashboardType?: string
    }
    accessToken: string
    refreshToken: string
  }

  interface User {
    id: string
    phone: string
    firstName?: string
    lastName?: string
    state: UserState
    roles: Array<{ id: number; name: string }>
    dashboardType?: string
    accessToken: string
    refreshToken: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string
    refreshToken: string
    user: AccountDTO
    accessTokenExpires: number
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "Phone and Password",
      credentials: {
        phone: { 
          label: "Phone Number", 
          type: "tel",
          placeholder: "+998901234567"
        },
        password: { 
          label: "Password", 
          type: "password" 
        }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null
        }

        try {
          // Use existing AuthService to authenticate with backend
          const jwtToken: JWTToken = await AuthService.signIn(
            credentials.phone as string,
            credentials.password as string
          )

          // Return user object that matches our User interface
          return {
            id: jwtToken.user.id.toString(),
            phone: jwtToken.user.phone,
            firstName: jwtToken.user.firstName,
            lastName: jwtToken.user.lastName,
            state: jwtToken.user.state,
            roles: jwtToken.user.roles || [],
            dashboardType: jwtToken.user.dashboardType,
            accessToken: jwtToken.accessToken,
            refreshToken: jwtToken.refreshToken,
          }
        } catch (error) {
          console.error("Authentication failed:", error)
          return null
        }
      }
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          user: {
            id: user.id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            state: user.state,
            roles: user.roles,
            dashboardType: user.dashboardType,
          },
          accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 minutes
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token)
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.user.id,
          phone: token.user.phone,
          firstName: token.user.firstName,
          lastName: token.user.lastName,
          state: token.user.state,
          roles: token.user.roles,
          dashboardType: token.user.dashboardType,
        }
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
      }
      return session
    },
  },

  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },

  events: {
    async signOut() {
      // Clean up any additional logout logic if needed
      console.log("User signed out")
    },
  },
})

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(token: JWT) {
  try {
    const refreshedTokens = await AuthService.refreshToken(token.refreshToken)

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 minutes
    }
  } catch (error) {
    console.error("Error refreshing access token:", error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}