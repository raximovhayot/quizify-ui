'use client';

import { History, Home } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import { AppHeader } from '@/components/shared/navigation/AppHeader';
import { TNavigationItem } from '@/components/shared/navigation/AppNavigation';
import { UserMenu } from '@/components/shared/navigation/UserMenu';

interface StudentHeaderProps {
  title?: string;
}

export function StudentHeader({ title: _title }: Readonly<StudentHeaderProps>) {
  const { user, logout } = useNextAuth();
  const t = useTranslations();

  const navItems: TNavigationItem[] = [
    {
      href: '/student',
      icon: Home,
      label: t('student.navigation.home', { fallback: 'Home' }),
    },
    {
      href: '/student/history',
      icon: History,
      label: t('student.navigation.history', { fallback: 'History' }),
    },
  ];

  const mobileTitle = t('student.navigation.title', {
    fallback: 'Student Panel',
  });
  const toggleMenuLabel = t('student.navigation.toggleMenu', {
    fallback: 'Toggle menu',
  });

  return (
    <AppHeader
      logoHref="/student"
      rootHref="/student"
      navItems={navItems}
      mobileTitle={mobileTitle}
      toggleMenuLabel={toggleMenuLabel}
      userMenu={
        user ? (
          <UserMenu user={user} onLogout={logout} i18nNamespace="student" />
        ) : null
      }
    />
  );
}
