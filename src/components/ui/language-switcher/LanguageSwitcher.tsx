'use client';

import { useState } from 'react';

import { useLocale } from 'next-intl';

import {
  type Language,
  type LanguageSwitcherVariant,
  languages,
} from './LanguageData';
import {
  LanguageSwitcherCompact,
  LanguageSwitcherDefault,
  LanguageSwitcherIconOnly,
  LanguageSwitcherSubMenu,
} from './LanguageSwitcherVariants';

export interface LanguageSwitcherProps {
  variant?: LanguageSwitcherVariant;
  className?: string;
}

export function LanguageSwitcher({
  variant = 'default',
  className,
}: Readonly<LanguageSwitcherProps>) {
  const currentLocale = useLocale();
  const [isChanging, setIsChanging] = useState(false);

  const currentLanguage: Language =
    languages.find((lang) => lang.code === currentLocale) || languages[0]!;

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

  if (variant === 'sub-menu') {
    return (
      <LanguageSwitcherSubMenu
        className={className}
        currentLocale={currentLocale}
        currentLanguage={currentLanguage}
        languages={languages}
        isChanging={isChanging}
        onChange={handleLanguageChange}
      />
    );
  }

  if (variant === 'icon-only') {
    return (
      <LanguageSwitcherIconOnly
        className={className}
        currentLocale={currentLocale}
        currentLanguage={currentLanguage}
        languages={languages}
        isChanging={isChanging}
        onChange={handleLanguageChange}
      />
    );
  }

  if (variant === 'compact') {
    return (
      <LanguageSwitcherCompact
        className={className}
        currentLocale={currentLocale}
        currentLanguage={currentLanguage}
        languages={languages}
        isChanging={isChanging}
        onChange={handleLanguageChange}
      />
    );
  }

  return (
    <LanguageSwitcherDefault
      className={className}
      currentLocale={currentLocale}
      currentLanguage={currentLanguage}
      languages={languages}
      isChanging={isChanging}
      onChange={handleLanguageChange}
    />
  );
}

export default LanguageSwitcher;
