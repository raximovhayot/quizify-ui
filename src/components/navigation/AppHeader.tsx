'use client';

import { ReactNode } from 'react';

import { Logo } from '@/components/brand/Logo';
import {
  AppNavigation,
  TNavigationItem,
} from '@/components/navigation/AppNavigation';

interface AppHeaderProps {
  logoHref: string;
  navItems: TNavigationItem[];
  rootHref: string;
  mobileTitle: string; // already translated
  toggleMenuLabel: string; // already translated
  userMenu?: ReactNode;
}

export function AppHeader({
  logoHref,
  navItems,
  rootHref,
  mobileTitle,
  toggleMenuLabel,
  userMenu,
}: Readonly<AppHeaderProps>) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-3 md:px-0">
        {/* Centered mobile logo */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center lg:hidden">
          <Logo href={logoHref} size="md" className="pointer-events-auto" />
        </div>

        {/* Left side - Logo/Brand and Navigation */}
        <AppNavigation
          items={navItems}
          rootHref={rootHref}
          logoHref={logoHref}
          mobileTitle={mobileTitle}
          toggleMenuLabel={toggleMenuLabel}
        />

        {/* Right side - Actions and User Menu */}
        <div className="flex items-center gap-2">
          {/* User Menu */}
          {userMenu}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
