'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppBreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function AppBreadcrumb({ items, className }: AppBreadcrumbProps) {
  const t = useTranslations();
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Remove locale from segments if present
    const locales = ['en', 'ru', 'uz'];
    if (segments.length > 0 && locales.includes(segments[0])) {
      segments.shift();
    }

    // Add home
    breadcrumbs.push({
      label: t('navigation.home'),
      href: '/',
    });

    // Build breadcrumbs from segments
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Map common segments to translated labels
      const segmentLabels: Record<string, string> = {
        'instructor': 'Instructor',
        'student': 'Student',
        'analytics': t('navigation.analytics'),
        'settings': t('navigation.settings'),
        'profile': t('navigation.profile'),
        'create': t('common.create'),
        'edit': t('common.edit'),
      };

      const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Don't add href for the last segment (current page)
      breadcrumbs.push({
        label,
        href: index === segments.length - 1 ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb for home page only
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink href={item.href} className="flex items-center gap-1">
                  {index === 0 && <Home className="h-3 w-3" />}
                  {item.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="flex items-center gap-1">
                  {index === 0 && <Home className="h-3 w-3" />}
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Convenience component for common breadcrumb patterns
export function DashboardBreadcrumb({ title }: { title?: string }) {
  const t = useTranslations();
  
  const items: BreadcrumbItem[] = [
    { label: t('navigation.home'), href: '/' },
    { label: t('navigation.dashboard'), href: '/dashboard' },
  ];

  if (title) {
    items.push({ label: title });
  }

  return <AppBreadcrumb items={items} />;
}
