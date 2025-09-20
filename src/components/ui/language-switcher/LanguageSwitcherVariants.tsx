import { Check, Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import type { Language } from './LanguageData';

export interface VariantBaseProps {
  className?: string;
  currentLocale: string;
  currentLanguage: Language;
  isChanging: boolean;
  languages: Language[];
  onChange: (code: string) => void;
}

export function LanguageSwitcherSubMenu({
  currentLocale,
  currentLanguage,
  languages,
  isChanging,
  onChange,
}: Readonly<VariantBaseProps>) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{currentLanguage.flag}</span>
          <span>{currentLanguage.nativeName}</span>
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-48">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => onChange(language.code)}
              className="flex items-center justify-between cursor-pointer"
              disabled={isChanging}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm">{language.flag}</span>
                <span>{language.nativeName}</span>
              </div>
              {language.code === currentLocale && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

export function LanguageSwitcherIconOnly({
  className,
  currentLocale,
  currentLanguage,
  languages,
  isChanging,
  onChange,
}: Readonly<VariantBaseProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-9 w-9 p-0', className)}
          disabled={isChanging}
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="sr-only">
            Change language - {currentLanguage.nativeName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => onChange(language.code)}
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

export function LanguageSwitcherCompact({
  className,
  currentLocale,
  currentLanguage,
  languages,
  isChanging,
  onChange,
}: Readonly<VariantBaseProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-8', className)}
          disabled={isChanging}
        >
          <span className="mr-1">{currentLanguage.flag}</span>
          <span className="font-medium">{currentLanguage.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => onChange(language.code)}
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

export function LanguageSwitcherDefault({
  className,
  currentLocale,
  currentLanguage,
  languages,
  isChanging,
  onChange,
}: Readonly<VariantBaseProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('justify-between min-w-[140px]', className)}
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
            onClick={() => onChange(language.code)}
            className="flex items-center justify-between cursor-pointer"
            disabled={isChanging}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{language.flag}</span>
              <div>
                <div className="font-medium">{language.nativeName}</div>
                <div className="text-xs text-muted-foreground">
                  {language.name}
                </div>
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
