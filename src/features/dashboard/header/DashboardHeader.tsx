'use client';

import { BarChart3, BookOpen, History, Home } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { useNextAuth } from '@/features/auth/hooks/useNextAuth';
import { AppHeader } from '@/components/shared/navigation/AppHeader';
import { TNavigationItem } from '@/components/shared/navigation/AppNavigation';
import { UserMenu } from '@/components/shared/navigation/UserMenu';

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
      href: '/dashboard',
      icon: Home,
      label: t('dashboard.navigation.home', { default: 'Home' }),
    },
    {
      href: '/dashboard/history',
      icon: History,
      label: t('dashboard.navigation.history', { default: 'History' }),
    },
    {
      href: '/dashboard/quizzes',
      icon: BookOpen,
      label: t('dashboard.navigation.quizzes', { default: 'Quizzes' }),
    },
    {
      href: '/dashboard/analytics',
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
      logoHref="/dashboard"
      rootHref="/dashboard"
      navItems={navItems}
      mobileTitle={mobileTitle}
      toggleMenuLabel={toggleMenuLabel}
      userMenu={
        user ? (
          <UserMenu
            user={user}
            onLogout={logout}
            i18nNamespace="dashboard"
            showNotificationsQuickActions={false}
          />
        ) : null
      }
    />
  );
}
