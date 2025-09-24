'use client';

import { BarChart3, BookOpen } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import { ROUTES_APP } from '@/components/features/instructor/routes';
import { AppHeader } from '@/components/shared/navigation/AppHeader';
import { TNavigationItem } from '@/components/shared/navigation/AppNavigation';
import { UserMenu } from '@/components/shared/navigation/UserMenu';

interface InstructorHeaderProps {
  title?: string;
}

export function InstructorHeader({
  title: _title,
}: Readonly<InstructorHeaderProps>) {
  const { user, logout } = useNextAuth();
  const t = useTranslations();

  const navItems: TNavigationItem[] = [
    {
      href: `${ROUTES_APP.baseUrl()}/quizzes`,
      icon: BookOpen,
      label: t('instructor.navigation.quizzes', { fallback: 'Quizzes' }),
    },
    {
      href: `${ROUTES_APP.baseUrl()}/analytics`,
      icon: BarChart3,
      label: t('instructor.navigation.analytics', { fallback: 'Analytics' }),
    },
  ];

  const mobileTitle = t('instructor.navigation.title', {
    fallback: 'Instructor Panel',
  });
  const toggleMenuLabel = t('instructor.navigation.toggleMenu', {
    fallback: 'Toggle menu',
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
            i18nNamespace="instructor"
            showNotificationsQuickActions={false}
          />
        ) : null
      }
    />
  );
}
