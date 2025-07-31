'use client';

import { LogOut, Settings, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

interface HeaderProps {
  title?: string;
  showUserMenu?: boolean;
}

export function Header({ title, showUserMenu = true }: HeaderProps) {
  const t = useTranslations();
  const { user, logout, isAuthenticated } = useNextAuth();
  const router = useRouter();

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
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo/Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold tracking-tight">
            {title || 'Quizify'}
          </h1>
        </div>

        {/* Right side - Language & User Menu */}
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <LanguageSwitcher variant="icon-only" />

          {/* User Menu */}
          {showUserMenu && isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User menu</span>
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
            >
              {t('auth.signIn')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
