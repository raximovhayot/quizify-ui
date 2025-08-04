'use client';

import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

export function HeaderActions() {
  return (
    <>
      {/* Theme Switcher */}
      <ThemeSwitcher variant="icon-only" />

      {/* Language Switcher */}
      <LanguageSwitcher variant="icon-only" />
    </>
  );
}
