'use client';

import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';

import { HeaderActions } from './HeaderActions';
import { Navigation } from './Navigation';
import { NotificationsDropdown } from './NotificationsDropdown';
import { UserMenu } from './UserMenu';

interface InstructorHeaderProps {
  title?: string;
}

export function InstructorHeader({ title }: InstructorHeaderProps) {
  const { user, logout } = useNextAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side - Logo/Brand and Navigation */}
        <Navigation />

        {/* Right side - Actions and User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* Theme and Language Switchers */}
          <HeaderActions />

          {/* User Menu */}
          {user && <UserMenu user={user} onLogout={logout} />}
        </div>
      </div>
    </header>
  );
}
