'use client';

import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import { HeaderActions } from '@/components/features/instructor/header/HeaderActions';
import { NotificationsDropdown } from '@/components/features/instructor/header/NotificationsDropdown';
import { Logo } from '@/components/shared/brand/Logo';

import { StudentNavigation } from './StudentNavigation';
import { StudentUserMenu } from './StudentUserMenu';

interface StudentHeaderProps {
  title?: string;
}

export function StudentHeader({ title: _title }: StudentHeaderProps) {
  const { user, logout } = useNextAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-3 md:px-0">
        {/* Centered mobile logo */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center lg:hidden">
          <Logo href="/student" size="md" className="pointer-events-auto" />
        </div>

        {/* Left side - Logo/Brand and Navigation */}
        <StudentNavigation />

        {/* Right side - Actions and User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifications (hidden on mobile) */}
          <div className="hidden lg:block">
            <NotificationsDropdown />
          </div>

          {/* Theme and Language Switchers (hidden on mobile) */}
          <div className="hidden lg:flex">
            <HeaderActions />
          </div>

          {/* User Menu */}
          {user && <StudentUserMenu user={user} onLogout={logout} />}
        </div>
      </div>
    </header>
  );
}
