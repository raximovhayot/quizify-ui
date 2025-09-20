'use client';

import { BarChart3, BookOpen, Home, Menu } from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/shared/brand/Logo';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

interface NavigationItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children?: NavigationItem[];
}

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations();
  const pathname = usePathname();
  const safePath = pathname ?? '/';

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
      return safePath === href;
    }
    return safePath.startsWith(href);
  };

  // Determine active section label for mobile title
  const allItems: NavigationItem[] = navigationItems.flatMap((i) => [
    i,
    ...(i.children ?? []),
  ]);
  const activeItem = allItems.reduce<NavigationItem | undefined>(
    (best, item) => {
      if (!isActiveLink(item.href)) return best;
      if (!best) return item;
      return item.href.length > best.href.length ? item : best;
    },
    undefined
  );
  const activeLabel =
    activeItem?.label ??
    t('instructor.navigation.title', { fallback: 'Instructor Panel' });

  return (
    <div className="flex items-center gap-4 flex-1">
      {/* Brand/Logo (hidden on mobile; visible on lg+) */}
      <Logo href="/instructor" size="md" className="hidden lg:flex" />

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

      {/* Mobile Title hidden per new mobile centered logo design */}
      <span className="hidden">{activeLabel}</span>

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
  );
}
