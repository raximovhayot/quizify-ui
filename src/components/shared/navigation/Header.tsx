'use client';

import { LogOut, Settings, User } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import Logo from '@/components/shared/brand/Logo';
import { useResponsive } from '@/components/shared/hooks/useResponsive';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

interface HeaderProps {
  title?: string;
  showUserMenu?: boolean;
}

export function Header({ title: _title, showUserMenu = true }: HeaderProps) {
  const t = useTranslations();
  const { user, logout, isAuthenticated } = useNextAuth();
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div
        className={`flex h-16 items-center justify-between ${isMobile ? 'px-3' : 'px-6'}`}
      >
        {/* Logo/Title */}
        <Logo />

        {/* Right side - Theme, Language & User Menu */}
        <div
          className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}
        >
          {/* Theme Selector */}
          <ThemeSwitcher variant="compact" />

          {/* Language Selector - Hide on mobile for space */}
          {!isMobile && <LanguageSwitcher variant="compact" />}

          {/* User Menu */}
          {showUserMenu && isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  aria-label={t('instructor.userMenu.title', {
                    fallback: 'User menu',
                  })}
                >
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.phone}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  {t('navigation.profile')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('auth.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Sign In Button for unauthenticated users */}
          {showUserMenu && !isAuthenticated && (
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push('/sign-in')}
              aria-label={t('auth.signIn.title', {
                fallback: 'Sign in to your account',
              })}
            >
              {t('auth.signIn.link', { fallback: 'Sign In' })}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
