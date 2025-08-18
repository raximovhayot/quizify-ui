'use client';

import { History, Home, Menu } from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/shared/brand/Logo';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
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
}

export function StudentNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations();
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
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

  const isActiveLink = (href: string) => {
    if (href === '/student') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex items-center gap-4 flex-1">
      {/* Brand/Logo (hidden on mobile; visible on lg+) */}
      <Logo href="/student" size="md" className="hidden lg:flex" />

      {/* Desktop Navigation */}
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          {navigationItems.map((item) => (
            <NavigationMenuItem key={item.href}>
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
              {t('student.navigation.toggleMenu', { fallback: 'Toggle menu' })}
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle className="text-left">
              {t('student.navigation.title', { fallback: 'Student Panel' })}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-2">
            {navigationItems.map((item) => (
              <div key={item.href}>
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
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
