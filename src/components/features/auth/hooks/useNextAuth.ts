import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { UserState } from "@/components/features/profile/types/account"

/**
 * Custom hook that wraps NextAuth session management
 * Provides compatibility with the existing authentication patterns
 */
export function useNextAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated" && !!session

  const user = session?.user || null

  const login = async (phone: string, password: string) => {
    const result = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    })

    if (result?.error) {
      throw new Error(result.error)
    }

    return result
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.push("/sign-in")
  }

  const hasRole = (roleName: string): boolean => {
    return user?.roles?.some(role => role.name === roleName) ?? false
  }

  const hasAnyRole = (roleNames: string[]): boolean => {
    return user?.roles?.some(role => roleNames.includes(role.name)) ?? false
  }

  const isNewUser = user?.state === UserState.NEW

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    isNewUser,
    login,
    logout,
    hasRole,
    hasAnyRole,
  }
}