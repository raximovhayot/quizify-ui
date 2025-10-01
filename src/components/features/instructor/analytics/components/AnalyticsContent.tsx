'use client';

import { Search } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import { AppPagination } from '@/components/shared/ui/AppPagination';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IPageableList } from '@/types/common';

import {
  AssignmentDTO,
  AssignmentFilter,
  AssignmentStatus,
} from '../types/assignment';
import { AssignmentsTable } from './AssignmentsTable';
import { AssignmentsTableSkeleton } from './AssignmentsTableSkeleton';

export interface AnalyticsContentProps {
  data: IPageableList<AssignmentDTO> | undefined;
  isLoading: boolean;
  isFetching: boolean;
  filter: AssignmentFilter;
  onSearch: (search: string) => void;
  onStatusFilter: (status: AssignmentStatus | string | undefined) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function AnalyticsContent({
  data,
  isLoading,
  isFetching,
  filter,
  onSearch,
  onStatusFilter,
  onPageChange,
  onPageSizeChange,
}: AnalyticsContentProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState(filter.search || '');

  // Sync local input with filter from URL
  useEffect(() => {
    setSearchQuery(filter.search || '');
  }, [filter.search]);

  // Debounce search
  useEffect(() => {
    const trimmed = (searchQuery || '').trim();
    const current = filter.search || '';
    if (trimmed === current) return;
    const id = setTimeout(() => onSearch(searchQuery), 400);
    return () => clearTimeout(id);
  }, [searchQuery, filter.search, onSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleStatusFilterChange = (value: string) => {
    if (value === 'all') onStatusFilter(undefined);
    else onStatusFilter(value as AssignmentStatus);
  };

  // Show skeleton while loading initially
  if (isLoading && !data) {
    return <AssignmentsTableSkeleton />;
  }

  const assignments = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.page || 0;
  const pageSize = data?.size || 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('instructor.analytics.title', { fallback: 'Analytics' })}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('instructor.analytics.subtitle', {
              fallback: 'Track quiz performance and student progress',
            })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('instructor.analytics.search.placeholder', {
                  fallback: 'Search assignments...',
                })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
          <div className="flex items-center gap-2">
            <Select
              value={filter.status || 'all'}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('instructor.analytics.filter.all', {
                    fallback: 'All Status',
                  })}
                </SelectItem>
                <SelectItem value={AssignmentStatus.PUBLISHED}>
                  {t('common.published', {
                    fallback: 'Published',
                  })}
                </SelectItem>
                <SelectItem value={AssignmentStatus.DRAFT}>
                  {t('common.draft', {
                    fallback: 'Draft',
                  })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results Summary + Page size */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('instructor.analytics.summary', {
            fallback: 'Showing {start} to {end} of {total} assignments',
            start: totalElements === 0 ? 0 : currentPage * pageSize + 1,
            end:
              totalElements === 0
                ? 0
                : Math.min((currentPage + 1) * pageSize, totalElements),
            total: totalElements,
          })}
        </p>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(parseInt(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignments Table */}
      <AssignmentsTable
        assignments={assignments}
        searchQuery={filter.search || ''}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <AppPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
