'use client';

import { useTranslations } from 'next-intl';

import { NotificationsDropdown } from '@/components/shared/navigation/NotificationsDropdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

interface User {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface UserMenuProps {
  user: User;
  onLogout: () => void;
  i18nNamespace?: 'student' | 'instructor';
  showNotificationsQuickActions?: boolean;
}

export function UserMenu({
  user,
  onLogout,
  i18nNamespace = 'instructor',
  showNotificationsQuickActions = true,
}: Readonly<UserMenuProps>) {
  const t = useTranslations();
  const ns = i18nNamespace;

  return (
    <>
      {/* Mobile: Sheet menu */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full p-0 ml-2"
              aria-label={t(`${ns}.userMenu.title`, {
                fallback: 'User menu',
              })}
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">
                {t(`${ns}.userMenu.title`, { fallback: 'User menu' })}
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-sm p-0">
            <SheetHeader className="p-4">
              <SheetTitle>
                {t(`${ns}.userMenu.title`, { fallback: 'User menu' })}
              </SheetTitle>
            </SheetHeader>

            {/* User Info */}
            <div className="px-4">
              <div className="flex items-center gap-3 rounded-md border p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  {user.phone ? (
                    <p className="text-xs text-muted-foreground">
                      {user.phone}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {t(`${ns}.role`, {
                      fallback: ns === 'student' ? 'Student' : 'Instructor',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="px-4 pt-3">
              <div className="flex items-center justify-start gap-2">
                {showNotificationsQuickActions ? (
                  <NotificationsDropdown />
                ) : null}
                <ThemeSwitcher variant="icon-only" />
                <LanguageSwitcher variant="icon-only" />
              </div>
            </div>

            {/* Menu items */}
            <div className="mt-2 flex flex-col gap-1 px-2 pb-4">
              <Button variant="ghost" className="h-12 justify-start text-base">
                {t(`${ns}.userMenu.profile`, { fallback: 'Profile' })}
              </Button>
              <Button variant="ghost" className="h-12 justify-start text-base">
                {t(`${ns}.userMenu.settings`, { fallback: 'Settings' })}
              </Button>
              <div className="my-2 h-px w-full bg-border" />
              <Button
                variant="ghost"
                className="h-12 justify-start text-base text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={onLogout}
              >
                {t(`${ns}.userMenu.logout`, { fallback: 'Log out' })}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Dropdown menu */}
      <div className="hidden lg:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full p-0 ml-2"
              aria-label={t(`${ns}.userMenu.title`, {
                fallback: 'User menu',
              })}
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">
                {t(`${ns}.userMenu.title`, { fallback: 'User menu' })}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.firstName} {user.lastName}
                </p>
                {user.phone ? (
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.phone}
                  </p>
                ) : null}
                <p className="text-xs leading-none text-muted-foreground">
                  {t(`${ns}.role`, {
                    fallback: ns === 'student' ? 'Student' : 'Instructor',
                  })}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <span>
                {t(`${ns}.userMenu.profile`, { fallback: 'Profile' })}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <span>
                {t(`${ns}.userMenu.settings`, { fallback: 'Settings' })}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
              onClick={onLogout}
            >
              <span>{t(`${ns}.userMenu.logout`, { fallback: 'Log out' })}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
