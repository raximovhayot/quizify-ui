'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { NotificationsDropdown } from '@/components/shared/navigation/NotificationsDropdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { ROUTES_APP } from '@/features/routes';

interface TUserMenuUser {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export type TUserMenuNamespace = 'student' | 'instructor' | 'dashboard';

interface UserMenuProps {
  user: TUserMenuUser;
  onLogout: () => void;
  i18nNamespace?: TUserMenuNamespace;
  showNotificationsQuickActions?: boolean;
}

export function UserMenu({
  user,
  onLogout,
  i18nNamespace: _i18nNamespace = 'dashboard',
  showNotificationsQuickActions = false,
}: Readonly<UserMenuProps>) {
  const t = useTranslations();
  const profileHref = ROUTES_APP.profile.root();
  const ns = _i18nNamespace; // Keep ns for template strings

  return (
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

      <DropdownMenuContent className="w-64" align="end" forceMount>
        {/* User info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {user.firstName} {user.lastName}
              </span>
              {user.phone ? (
                <span className="text-xs leading-none text-muted-foreground">
                  {user.phone}
                </span>
              ) : null}
              <span className="text-xs leading-none text-muted-foreground">
                {t(`${ns}.role`, {
                  fallback: 'User',
                })}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        {/* Preferences inside dropdown (no extra buttons) */}
        {showNotificationsQuickActions ? (
          <div className="px-2 pb-2">
            <NotificationsDropdown />
          </div>
        ) : null}

        <DropdownMenuGroup>
          {/* Menu items */}
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href={profileHref}>
              <span>
                {t(`${ns}.userMenu.profile`, { fallback: 'Profile' })}
              </span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <LanguageSwitcher variant="sub-menu" />

          <ThemeSwitcher variant="sub-menu" />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
          onClick={onLogout}
        >
          <span>{t(`${ns}.userMenu.logout`, { fallback: 'Log out' })}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
