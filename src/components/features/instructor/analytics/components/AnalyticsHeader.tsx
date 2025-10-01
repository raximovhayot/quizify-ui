'use client';

import { Search } from 'lucide-react';

import React from 'react';

import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';

interface AnalyticsHeaderProps {
  titleKey?: string; // i18n key, defaults to instructor.analytics.title
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export function AnalyticsHeader({
  titleKey = 'instructor.analytics.title',
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: Readonly<AnalyticsHeaderProps>) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t(titleKey, { fallback: 'Analytics' })}
        </h1>
      </div>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <form onSubmit={onSearchSubmit} className="flex-1 sm:w-[320px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('instructor.analytics.search.placeholder', {
                fallback: 'Search assignments...',
              })}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default AnalyticsHeader;
