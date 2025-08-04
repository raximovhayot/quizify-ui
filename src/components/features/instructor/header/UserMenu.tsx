'use client';

import { useTranslations } from 'next-intl';

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

interface User {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const t = useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 ml-2"
        >
          <Avatar className="h-9 w-9">
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
              {user.phone}
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
          onClick={onLogout}
        >
          <span>
            {t('instructor.userMenu.logout', { fallback: 'Log out' })}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
