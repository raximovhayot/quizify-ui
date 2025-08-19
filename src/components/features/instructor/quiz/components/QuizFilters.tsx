'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { useDebounce } from '@/components/shared/hooks/useDebounce';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { QuizFilter, QuizStatus } from '../types/quiz';

export interface QuizFiltersProps {
  filter: QuizFilter;
  onSearch: (search: string) => void;
  onStatusFilter: (status: QuizStatus | undefined) => void;
  className?: string;
}

export function QuizFilters({
  filter,
  onSearch,
  onStatusFilter,
  className,
}: QuizFiltersProps) {
  const t = useTranslations();

  // Local state for immediate UI updates
  const [searchValue, setSearchValue] = useState(filter.search || '');

  // Debounce the search to avoid excessive API calls
  const debouncedSearchValue = useDebounce(searchValue, 500);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedSearchValue !== filter.search) {
      onSearch(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onSearch, filter.search]);

  // Update local state when filter prop changes (external updates)
  useEffect(() => {
    if (filter.search !== searchValue) {
      setSearchValue(filter.search || '');
    }
  }, [filter.search, searchValue]);

  const statusOptions = useMemo(
    () => [
      { value: '', label: t('common.all', { fallback: 'All' }) },
      {
        value: QuizStatus.DRAFT,
        label: t('quiz.status.draft', { fallback: 'Draft' }),
      },
      {
        value: QuizStatus.PUBLISHED,
        label: t('quiz.status.published', { fallback: 'Published' }),
      },
    ],
    [t]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
    },
    []
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      onStatusFilter(value === '' ? undefined : (value as QuizStatus));
    },
    [onStatusFilter]
  );

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">
              {t('common.search', { fallback: 'Search' })}
            </Label>
            <Input
              id="search"
              type="search"
              placeholder={t('instructor.quiz.search.placeholder', {
                fallback: 'Search quizzes...',
              })}
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="status-filter"
              className="whitespace-nowrap text-sm"
            >
              {t('common.status', { fallback: 'Status' })}:
            </Label>
            <Select
              value={filter.status || ''}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="status-filter" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
