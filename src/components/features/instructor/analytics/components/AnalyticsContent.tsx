'use client';

import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  Users,
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import { AppPagination } from '@/components/shared/ui/AppPagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { AnalyticsListSkeleton } from './AnalyticsListSkeleton';
import { AssignmentCard } from './AssignmentCard';

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
    return <AnalyticsListSkeleton />;
  }

  const assignments = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.page || 0;
  const pageSize = data?.size || 10;

  // Calculate stats (mock data for now - can be enhanced with real backend data)
  const publishedCount = assignments.filter(
    (a) => a.status === AssignmentStatus.PUBLISHED
  ).length;
  const draftCount = assignments.filter(
    (a) => a.status === AssignmentStatus.DRAFT
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('instructor.analytics.stats.total', {
                fallback: 'Total Assignments',
              })}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElements}</div>
            <p className="text-xs text-muted-foreground">
              {t('instructor.analytics.stats.total.subtitle', {
                fallback: 'All time',
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('instructor.analytics.stats.published', {
                fallback: 'Published',
              })}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('instructor.analytics.stats.published.subtitle', {
                fallback: 'Active assignments',
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('instructor.analytics.stats.draft', {
                fallback: 'Drafts',
              })}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('instructor.analytics.stats.draft.subtitle', {
                fallback: 'In progress',
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('instructor.analytics.stats.completion', {
                fallback: 'Avg. Completion',
              })}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              {t('instructor.analytics.stats.completion.subtitle', {
                fallback: 'Coming soon',
              })}
            </p>
          </CardContent>
        </Card>
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

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">
            {filter.search || filter.status
              ? t('instructor.analytics.no.results', {
                  fallback: 'No assignments found',
                })
              : t('instructor.analytics.empty', {
                  fallback: 'No assignments yet',
                })}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter.search || filter.status
              ? t('instructor.analytics.no.results.description', {
                  fallback: 'Try adjusting your filters',
                })
              : t('instructor.analytics.empty.description', {
                  fallback: 'Create a quiz and assign it to students',
                })}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
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
