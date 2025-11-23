'use client';

import { BarChart3, BookOpen, History, Home } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { useNextAuth } from '@/features/auth/hooks/useNextAuth';
import { ROUTES_APP } from '@/features/routes';
import { AppHeader } from '@/components/navigation/AppHeader';
import { TNavigationItem } from '@/components/navigation/AppNavigation';
import { UserMenu } from '@/components/navigation/UserMenu';

interface DashboardHeaderProps {
  title?: string;
}

export function DashboardHeader({
  title: _title,
}: Readonly<DashboardHeaderProps>) {
  const { user, logout } = useNextAuth();
  const t = useTranslations();

  // All users see all navigation items
  const navItems: TNavigationItem[] = [
    {
      href: ROUTES_APP.home(),
      icon: Home,
      label: t('dashboard.navigation.home', { default: 'Home' }),
    },
    {
      href: ROUTES_APP.history(),
      icon: History,
      label: t('dashboard.navigation.history', { default: 'History' }),
    },
    {
      href: ROUTES_APP.quizzes.list(),
      icon: BookOpen,
      label: t('dashboard.navigation.quizzes', { default: 'Quizzes' }),
    },
    {
      href: ROUTES_APP.analytics.root(),
      icon: BarChart3,
      label: t('dashboard.navigation.analytics', { default: 'Analytics' }),
    },
  ];

  const mobileTitle = t('dashboard.navigation.title', {
    default: 'Dashboard',
  });
  const toggleMenuLabel = t('dashboard.navigation.toggleMenu', {
    default: 'Toggle menu',
  });

  return (
    <AppHeader
      logoHref={ROUTES_APP.root()}
      rootHref={ROUTES_APP.root()}
      navItems={navItems}
      mobileTitle={mobileTitle}
      toggleMenuLabel={toggleMenuLabel}
      userMenu={
        user ? (
          <UserMenu
            user={user}
            onLogout={logout}
            i18nNamespace="dashboard"
          />
        ) : null
      }
    />
  );
}
