'use client';

import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  FileText,
  Home,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  User,
  UserCircle,
  Users,
  X,
} from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import { Logo } from '@/components/shared/brand/Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { cn } from '@/lib/utils';

interface NavigationItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children?: NavigationItem[];
}

interface InstructorHeaderProps {
  title?: string;
}

export function InstructorHeader({ title }: InstructorHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations();
  const { user, logout } = useNextAuth();
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    {
      href: '/instructor',
      icon: Home,
      label: t('instructor.navigation.dashboard', { fallback: 'Dashboard' }),
    },
    {
      href: '/instructor/quizzes',
      icon: BookOpen,
      label: t('instructor.navigation.quizzes', { fallback: 'Quizzes' }),
    },
    {
      href: '/instructor/analytics',
      icon: BarChart3,
      label: t('instructor.navigation.analytics', { fallback: 'Analytics' }),
    },
  ];

  const isActiveLink = (href: string) => {
    if (href === '/instructor') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Mock notifications - in real app, this would come from API
  const notifications = [
    {
      id: 1,
      title: t('instructor.notifications.newSubmission', {
        fallback: 'New quiz submission',
      }),
      message: t('instructor.notifications.submissionMessage', {
        fallback: 'Student completed Quiz #1',
      }),
      time: '5 min ago',
      unread: true,
    },
    {
      id: 2,
      title: t('instructor.notifications.lowScore', {
        fallback: 'Low score alert',
      }),
      message: t('instructor.notifications.lowScoreMessage', {
        fallback: 'Multiple students scored below 60%',
      }),
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: t('instructor.notifications.quizCompleted', {
        fallback: 'Quiz completed',
      }),
      message: t('instructor.notifications.quizCompletedMessage', {
        fallback: 'All students completed Quiz #2',
      }),
      time: '2 hours ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side - Logo/Brand and Navigation */}
        <div className="flex items-center gap-4 flex-1">
          {/* Brand/Logo */}
          <Logo
            href="/instructor"
            size="md"
            textClassName="hidden font-bold sm:inline-block"
          />

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  {item.children ? (
                    <>
                      <NavigationMenuTrigger
                        className={cn(
                          'h-9 px-3 text-sm font-medium',
                          isActiveLink(item.href) &&
                            'bg-accent text-accent-foreground'
                        )}
                      >
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-48 gap-1 p-2">
                          {item.children.map((child) => (
                            <NavigationMenuLink key={child.href} asChild>
                              <Link
                                href={child.href}
                                className={cn(
                                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                                  isActiveLink(child.href) &&
                                    'bg-accent text-accent-foreground'
                                )}
                              >
                                {child.label}
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                          isActiveLink(item.href) &&
                            'bg-accent text-accent-foreground'
                        )}
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">
                  {t('instructor.navigation.toggleMenu')}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">
                  {t('instructor.navigation.title', {
                    fallback: 'Instructor Panel',
                  })}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {navigationItems.map((item) => (
                  <div key={item.href}>
                    {item.children ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </div>
                        <div className="ml-6 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                                isActiveLink(child.href) &&
                                  'bg-accent text-accent-foreground'
                              )}
                            >
                              <child.icon className="h-4 w-4" />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                          isActiveLink(item.href) &&
                            'bg-accent text-accent-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Right side - Actions and User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
                <span className="sr-only">
                  {t('instructor.notifications.title', {
                    fallback: 'Notifications',
                  })}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-2">
                <h3 className="font-semibold">
                  {t('instructor.notifications.title', {
                    fallback: 'Notifications',
                  })}
                </h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount}</Badge>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex-col items-start p-3"
                  >
                    <div className="flex w-full items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {notification.title}
                          </p>
                          {notification.unread && (
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center">
                <span className="text-sm">
                  {t('instructor.notifications.viewAll', {
                    fallback: 'View all notifications',
                  })}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Switcher */}
          <ThemeSwitcher variant="icon-only" />

          {/* Language Switcher */}
          <LanguageSwitcher variant="icon-only" />

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 ml-2"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.avatar || user.profileImage}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">
                    {t('instructor.userMenu.title', { fallback: 'User menu' })}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email || user.phone}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {t('instructor.role', { fallback: 'Instructor' })}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <span>
                    {t('instructor.userMenu.profile', { fallback: 'Profile' })}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <span>
                    {t('instructor.userMenu.settings', {
                      fallback: 'Settings',
                    })}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                  onClick={() => logout()}
                >
                  <span>
                    {t('instructor.userMenu.logout', { fallback: 'Log out' })}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
