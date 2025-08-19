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

import { AssignmentDTO, AssignmentStatus } from '../types/assignment';

export interface AssignmentsListProps {
  items: AssignmentDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  filter: { search?: string; status?: AssignmentStatus | string };
  onSearch: (search: string) => void;
  onStatusFilter: (status: AssignmentStatus | string | undefined) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function AssignmentsList({
  items,
  totalElements,
  totalPages,
  currentPage,
  pageSize,
  filter,
  onSearch,
  onStatusFilter,
  onPageChange,
  onPageSizeChange,
}: AssignmentsListProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState(filter.search || '');

  // Sync local input with filter from URL
  useEffect(() => {
    setSearchQuery(filter.search || '');
  }, [filter.search]);

  // Debounce search like quizzes page
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t('instructor.analytics.assignments.title', {
            fallback: 'Assignments',
          })}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {t('instructor.analytics.assignments.subtitle', {
            fallback: 'Overview of assigned quizzes',
          })}
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t(
                  'instructor.analytics.assignments.search.placeholder',
                  {
                    fallback: 'Search assignments...',
                  }
                )}
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
                  {t('instructor.analytics.assignments.filter.all', {
                    fallback: 'All Status',
                  })}
                </SelectItem>
                <SelectItem value={AssignmentStatus.PUBLISHED}>
                  {t('instructor.analytics.assignments.status.published', {
                    fallback: 'Published',
                  })}
                </SelectItem>
                <SelectItem value={AssignmentStatus.DRAFT}>
                  {t('instructor.analytics.assignments.status.draft', {
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
          {t('instructor.analytics.assignments.summary', {
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

      {/* List */}
      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {filter.search || filter.status
              ? t('instructor.analytics.assignments.no.results', {
                  fallback: 'No assignments found matching your criteria.',
                })
              : t('instructor.analytics.assignments.empty', {
                  fallback: 'No assignments found.',
                })}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((a) => (
            <Card key={a.id} className="p-4 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {t('instructor.analytics.assignments.meta', {
                    fallback:
                      'Status: {status} · Created: {created} · Due: {due}',
                    status: a.status ?? AssignmentStatus.DRAFT,
                    created: a.createdDate
                      ? new Date(a.createdDate).toLocaleString()
                      : '—',
                    due: a.dueDate ? new Date(a.dueDate).toLocaleString() : '—',
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
