'use client';

import { BarChart3, BookOpen, History, Home } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { useNextAuth } from '@/features/auth/hooks/useNextAuth';
import { UserRole } from '@/features/profile/types/account';
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

  // Check user roles to determine available navigation items
  const hasInstructorRole = user?.roles?.some(
    (role) => role.name === UserRole.INSTRUCTOR
  );
  const hasStudentRole = user?.roles?.some(
    (role) => role.name === UserRole.STUDENT
  );

  const navItems: TNavigationItem[] = [];

  // Add student navigation items
  if (hasStudentRole) {
    navItems.push({
      href: '/dashboard',
      icon: Home,
      label: t('dashboard.navigation.home', { default: 'Home' }),
    });
    navItems.push({
      href: '/dashboard/history',
      icon: History,
      label: t('dashboard.navigation.history', { default: 'History' }),
    });
  }

  // Add instructor navigation items
  if (hasInstructorRole) {
    navItems.push({
      href: '/dashboard/quizzes',
      icon: BookOpen,
      label: t('dashboard.navigation.quizzes', { default: 'Quizzes' }),
    });
    navItems.push({
      href: '/dashboard/analytics',
      icon: BarChart3,
      label: t('dashboard.navigation.analytics', { default: 'Analytics' }),
    });
  }

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
