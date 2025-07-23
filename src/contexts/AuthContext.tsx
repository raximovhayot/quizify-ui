'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccountDTO, AuthContextType } from '@/types/auth';
import { AuthService } from '@/lib/auth-service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (accessToken && storedUser) {
        try {
          // Verify token with backend
          const userData = await AuthService.verifyToken(accessToken);
          setUser(userData);
        } catch {
          // Token is invalid, try to refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const tokens = await AuthService.refreshToken(refreshToken);
              localStorage.setItem('accessToken', tokens.accessToken);
              localStorage.setItem('refreshToken', tokens.refreshToken);

              // Also update cookies for middleware compatibility
              document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=${15 * 60}`; // 15 minutes
              document.cookie = `refreshToken=${tokens.refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days

              // Verify new token
              const userData = await AuthService.verifyToken(tokens.accessToken);
              setUser(userData);
              
              // Update user cookie as well
              document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
            } catch {
              // Refresh failed, clear stored data
              localStorage.removeItem('user');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              
              // Also clear cookies
              document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
          } else {
            // No refresh token, clear stored data
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            
            // Also clear cookies
            document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      // Use AuthService to authenticate user
      const jwtToken = await AuthService.login(phone, password);

      // Extract user data and tokens from response
      const userData: AccountDTO = jwtToken.user;

      // Store user data and tokens in localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', jwtToken.accessToken);
      localStorage.setItem('refreshToken', jwtToken.refreshToken);

      // Also set cookies for middleware compatibility
      document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      document.cookie = `accessToken=${jwtToken.accessToken}; path=/; max-age=${15 * 60}`; // 15 minutes
      document.cookie = `refreshToken=${jwtToken.refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout service (client-side only for JWT)
      await AuthService.logout();
    } catch (error) {
      // Log error but don't prevent logout
      console.warn('Logout service failed:', error);
    } finally {
      // Always clear local state and storage
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Also clear cookies for middleware compatibility
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  const hasRole = (roleName: string): boolean => {
    return user?.roles?.some(role => role.name === roleName) ?? false;
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return user?.roles?.some(role => roleNames.includes(role.name)) ?? false;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isLoading,
    isAuthenticated: user !== null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
