'use client';

import { useState } from 'react';

import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Theme {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  translationKey: string;
}

const themes: Theme[] = [
  {
    value: 'light',
    icon: Sun,
    translationKey: 'theme.light',
  },
  {
    value: 'dark',
    icon: Moon,
    translationKey: 'theme.dark',
  },
  {
    value: 'system',
    icon: Monitor,
    translationKey: 'theme.system',
  },
];

interface ThemeSwitcherProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export function ThemeSwitcher({
  variant = 'default',
  className,
}: ThemeSwitcherProps) {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const [isChanging, setIsChanging] = useState(false);

  const currentTheme = themes.find((t) => t.value === theme) || themes[2]; // Default to system

  const handleThemeChange = async (newTheme: string) => {
    if (newTheme === theme || isChanging) return;

    setIsChanging(true);

    try {
      setTheme(newTheme);
      // Small delay to show the changing state
      setTimeout(() => setIsChanging(false), 100);
    } catch (error) {
      console.error('Error changing theme:', error);
      setIsChanging(false);
    }
  };

  if (variant === 'icon-only') {
    const IconComponent = currentTheme?.icon || Monitor;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-9 w-9 p-0', className)}
            disabled={isChanging}
          >
            <IconComponent className="h-4 w-4" />
            <span className="sr-only">{t('theme.changeTheme')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {themes.map((themeOption) => {
            const IconComponent = themeOption.icon;
            return (
              <DropdownMenuItem
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value)}
                className="flex items-center justify-between cursor-pointer"
                disabled={isChanging}
              >
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-4 w-4" />
                  <span>{t(themeOption.translationKey)}</span>
                </div>
                {themeOption.value === theme && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'compact') {
    const IconComponent = currentTheme?.icon || Monitor;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-9 px-3 flex items-center space-x-2', className)}
            disabled={isChanging}
          >
            <IconComponent className="h-4 w-4" />
            <span className="text-sm font-medium">
              {t(currentTheme?.translationKey || 'theme.system')}
            </span>
            <span className="sr-only">{t('theme.changeTheme')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {themes.map((themeOption) => {
            const IconComponent = themeOption.icon;
            return (
              <DropdownMenuItem
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value)}
                className="flex items-center justify-between cursor-pointer"
                disabled={isChanging}
              >
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-4 w-4" />
                  <span>{t(themeOption.translationKey)}</span>
                </div>
                {themeOption.value === theme && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant
  const IconComponent = currentTheme?.icon || Monitor;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('flex items-center space-x-2', className)}
          disabled={isChanging}
        >
          <IconComponent className="h-4 w-4" />
          <span>{t(currentTheme?.translationKey || 'theme.system')}</span>
          <span className="sr-only">{t('theme.changeTheme')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((themeOption) => {
          const IconComponent = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => handleThemeChange(themeOption.value)}
              className="flex items-center justify-between cursor-pointer"
              disabled={isChanging}
            >
              <div className="flex items-center space-x-2">
                <IconComponent className="h-4 w-4" />
                <span>{t(themeOption.translationKey)}</span>
              </div>
              {themeOption.value === theme && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}