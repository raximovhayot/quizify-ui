'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
  },
  {
    code: 'uz',
    name: 'Uzbek',
    nativeName: 'O\'zbek',
    flag: '🇺🇿',
  },
];

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export function LanguageSwitcher({ 
  variant = 'default', 
  className 
}: LanguageSwitcherProps) {
  const currentLocale = useLocale();
  const [isChanging, setIsChanging] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = async (newLocale: string) => {
    if (newLocale === currentLocale || isChanging) return;

    setIsChanging(true);

    try {
      // Store the language preference in both localStorage and cookies
      localStorage.setItem('preferredLanguage', newLocale);
      
      // Set cookie that can be read by server-side rendering
      document.cookie = `preferredLanguage=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      
      // Since we don't use locale-based routing anymore, 
      // we need to reload the page to apply the new language
      window.location.reload();
    } catch (error) {
      console.error('Error changing language:', error);
      setIsChanging(false);
    }
  };

  if (variant === 'icon-only') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("h-9 w-9 p-0", className)}
            disabled={isChanging}
          >
            <Globe className="h-4 w-4" />
            <span className="sr-only">Change language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center justify-between cursor-pointer"
              disabled={isChanging}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{language.flag}</span>
                <span>{language.nativeName}</span>
              </div>
              {language.code === currentLocale && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn("h-8", className)}
            disabled={isChanging}
          >
            <span className="mr-1">{currentLanguage.flag}</span>
            <span className="text-xs font-medium">{currentLanguage.code.toUpperCase()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center justify-between cursor-pointer"
              disabled={isChanging}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{language.flag}</span>
                <span>{language.nativeName}</span>
              </div>
              {language.code === currentLocale && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("justify-between min-w-[140px]", className)}
          disabled={isChanging}
        >
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>{currentLanguage.nativeName}</span>
          </div>
          <span className="ml-2 text-xs text-muted-foreground">
            {currentLanguage.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
          Select Language
        </div>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer"
            disabled={isChanging}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{language.flag}</span>
              <div>
                <div className="font-medium">{language.nativeName}</div>
                <div className="text-xs text-muted-foreground">{language.name}</div>
              </div>
            </div>
            {language.code === currentLocale && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}