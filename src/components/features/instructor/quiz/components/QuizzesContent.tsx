'use client';

import { Search } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import { AppPagination } from '@/components/shared/ui/AppPagination';
import { Button } from '@/components/ui/button';
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

import { QuizDataDTO, QuizFilter, QuizStatus } from '../types/quiz';
import { QuizListSkeleton } from './QuizListSkeleton';
import { QuizTable } from './QuizTable';

export interface QuizzesContentProps {
  data: IPageableList<QuizDataDTO> | undefined;
  isLoading: boolean;
  isFetching: boolean;
  filter: QuizFilter;
  onSearch: (search: string) => void;
  onStatusFilter: (status: QuizStatus | undefined) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
  onUpdateStatus: (id: number, status: QuizStatus) => void;
  isDeleting: boolean;
  isUpdatingStatus: boolean;
}

export function QuizzesContent({
  data,
  isLoading,
  isFetching,
  filter,
  onSearch,
  onStatusFilter,
  onPageChange,
  onPageSizeChange,
  onCreate,
  onDelete,
  onUpdateStatus,
  isDeleting,
  isUpdatingStatus,
}: QuizzesContentProps) {
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
    else onStatusFilter(value as QuizStatus);
  };

  // Show skeleton while loading initially
  if (isLoading && !data) {
    return <QuizListSkeleton />;
  }

  const quizzes = data?.content || [];
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
            {t('instructor.quiz.list.title', { fallback: 'Your Quizzes' })}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('instructor.quiz.list.subtitle', {
              fallback: 'Manage your quiz library',
            })}
          </p>
        </div>
        <Button onClick={onCreate}>
          {t('instructor.quiz.create.button', { fallback: 'Create Quiz' })}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('instructor.quiz.search.placeholder', {
                  fallback: 'Search quizzes...',
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
                  {t('instructor.quiz.filter.all', {
                    fallback: 'All Status',
                  })}
                </SelectItem>
                <SelectItem value={QuizStatus.PUBLISHED}>
                  {t('common.published', {
                    fallback: 'Published',
                  })}
                </SelectItem>
                <SelectItem value={QuizStatus.DRAFT}>
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
          {t('instructor.quiz.summary', {
            fallback: 'Showing {start} to {end} of {total} quizzes',
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

      {/* Quiz Table */}
      <QuizTable
        quizzes={quizzes}
        onDelete={onDelete}
        onUpdateStatus={onUpdateStatus}
        searchQuery={filter.search || ''}
        isDeleting={isDeleting}
        isUpdatingStatus={isUpdatingStatus}
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
