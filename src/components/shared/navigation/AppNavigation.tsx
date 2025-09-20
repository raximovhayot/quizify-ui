'use client';

import { Menu } from 'lucide-react';

import { useState } from 'react';

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

export interface TNavigationItem {
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  children?: TNavigationItem[];
}

interface AppNavigationProps {
  items: TNavigationItem[];
  rootHref: string;
  logoHref: string;
  mobileTitle: string; // already translated string for header title; will be overridden by active label when available
  toggleMenuLabel: string; // already translated string for SR-only toggle label
}

export function AppNavigation({
  items,
  rootHref,
  logoHref,
  mobileTitle,
  toggleMenuLabel,
}: Readonly<AppNavigationProps>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const safePath = pathname ?? '/';

  const isActiveLink = (href: string) => {
    if (href === rootHref) {
      return safePath === href;
    }
    return safePath.startsWith(href);
  };

  // Determine active section label for mobile title
  const allItems: TNavigationItem[] = items.flatMap((i) => [
    i,
    ...(i.children ?? []),
  ]);
  const activeItem = allItems.reduce<TNavigationItem | undefined>(
    (best, item) => {
      if (!isActiveLink(item.href)) return best;
      if (!best) return item;
      return item.href.length > best.href.length ? item : best;
    },
    undefined
  );
  const activeLabel = activeItem?.label ?? mobileTitle;

  return (
    <div className="flex items-center gap-4 flex-1">
      {/* Brand/Logo (hidden on mobile; visible on lg+) */}
      <Logo href={logoHref} size="md" className="hidden lg:flex" />

      {/* Desktop Navigation */}
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          {items.map((item) => (
            <NavigationMenuItem key={item.href}>
              {item.children && item.children.length ? (
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
                              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
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
            <span className="sr-only">{toggleMenuLabel}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle className="text-left">{activeLabel}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-2">
            {items.map((item) => (
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
                  {item.icon ? <item.icon className="h-4 w-4" /> : null}
                  {item.label}
                </Link>
                {item.children && item.children.length ? (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground',
                          isActiveLink(child.href) &&
                            'bg-accent text-accent-foreground'
                        )}
                      >
                        {child.icon ? <child.icon className="h-4 w-4" /> : null}
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default AppNavigation;
