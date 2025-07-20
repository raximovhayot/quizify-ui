'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Home, 
  BookOpen, 
  ClipboardList, 
  BarChart3, 
  Settings,
  PlusCircle,
  Users,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

export function Sidebar({ className }: SidebarProps) {
  const t = useTranslations();
  const { user, hasRole } = useAuth();
  const pathname = usePathname();

  // Navigation items based on user roles
  const navItems: NavItem[] = [
    {
      title: t('navigation.dashboard'),
      href: hasRole('INSTRUCTOR') ? '/instructor' : '/student',
      icon: Home,
    },
    // Instructor-specific items
    {
      title: t('navigation.quizzes'),
      href: '/instructor/quizzes',
      icon: BookOpen,
      roles: ['INSTRUCTOR'],
    },
    {
      title: t('quiz.createQuiz'),
      href: '/instructor/quizzes/create',
      icon: PlusCircle,
      roles: ['INSTRUCTOR'],
    },
    {
      title: t('navigation.assignments'),
      href: '/instructor/assignments',
      icon: ClipboardList,
      roles: ['INSTRUCTOR'],
    },
    {
      title: t('navigation.analytics'),
      href: '/instructor/analytics',
      icon: BarChart3,
      roles: ['INSTRUCTOR'],
    },
    {
      title: 'Students',
      href: '/instructor/students',
      icon: Users,
      roles: ['INSTRUCTOR'],
    },
    // Student-specific items
    {
      title: t('navigation.assignments'),
      href: '/student/assignments',
      icon: ClipboardList,
      roles: ['STUDENT'],
    },
    {
      title: 'My Quizzes',
      href: '/student/quizzes',
      icon: BookOpen,
      roles: ['STUDENT'],
    },
    {
      title: 'Schedule',
      href: '/student/schedule',
      icon: Calendar,
      roles: ['STUDENT'],
    },
    // Common items
    {
      title: t('navigation.settings'),
      href: '/settings',
      icon: Settings,
    },
  ];

  // Filter nav items based on user roles
  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true; // Show items without role restrictions
    return item.roles.some(role => hasRole(role as 'INSTRUCTOR' | 'STUDENT'));
  });

  const isActive = (href: string) => {
    if (href === '/instructor' || href === '/student') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  if (!user) return null;

  return (
    <div className={cn("flex h-full w-64 flex-col border-r bg-background", className)}>
      {/* Sidebar Header */}
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold tracking-tight">
          {hasRole('INSTRUCTOR') ? 'Instructor' : 'Student'}
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  active && "bg-secondary font-medium"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {user.firstName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}