'use client';

import { Filter, Plus, Search } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

import { QuizDataDTO, QuizFilter, QuizStatus } from '../types/quiz';
import { QuizCard } from './QuizCard';
import { QuizPagination } from './QuizPagination';

export interface QuizListProps {
  quizzes: QuizDataDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isFirst: boolean;
  isLast: boolean;
  filter: QuizFilter;
  onSearch: (search: string) => void;
  onStatusFilter: (status: QuizStatus | undefined) => void;
  onSortChange: (field?: string, direction?: 'ASC' | 'DESC') => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDeleteQuiz: (quizId: number) => void;
  onUpdateQuizStatus: (quizId: number, status: QuizStatus) => void;
  isDeleting?: boolean;
  isUpdatingStatus?: boolean;
  className?: string;
}

export function QuizList({
  quizzes,
  totalElements,
  totalPages,
  currentPage,
  pageSize,
  isFirst,
  isLast,
  filter,
  onSearch,
  onStatusFilter,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onDeleteQuiz,
  onUpdateQuizStatus,
  isDeleting = false,
  isUpdatingStatus = false,
  className,
}: QuizListProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState(filter.search || '');
  const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null);

  // Keep input in sync when URL-derived filter changes (e.g., back/forward)
  useEffect(() => {
    const nextValue = filter.search || '';
    setSearchQuery(nextValue);
  }, [filter.search]);

  // Debounce search updates to avoid excessive requests
  useEffect(() => {
    const trimmed = searchQuery.trim();
    const current = filter.search || '';
    if (trimmed === current) return;
    const id = setTimeout(() => {
      onSearch(searchQuery);
    }, 400);
    return () => clearTimeout(id);
  }, [searchQuery, filter.search, onSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleStatusFilterChange = (value: string) => {
    if (value === 'all') {
      onStatusFilter(undefined);
    } else {
      onStatusFilter(value as QuizStatus);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteQuizId) {
      onDeleteQuiz(deleteQuizId);
      setDeleteQuizId(null);
    }
  };

  const currentSortField =
    filter.sorts && filter.sorts[0]?.field
      ? filter.sorts[0].field
      : 'createdDate';
  const currentSortDir: 'ASC' | 'DESC' =
    filter.sorts && filter.sorts[0]?.direction
      ? (filter.sorts[0].direction as 'ASC' | 'DESC')
      : 'DESC';

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('instructor.quiz.title', { fallback: 'Quizzes' })}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('instructor.quiz.subtitle', {
              fallback: 'Create and manage your quizzes',
            })}
          </p>
        </div>
        <Button asChild>
          <Link href="/instructor/quizzes/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('instructor.quiz.create.button', { fallback: 'Create Quiz' })}
          </Link>
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
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filter.status || 'all'}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('instructor.quiz.filter.all', { fallback: 'All Status' })}
                </SelectItem>
                <SelectItem value={QuizStatus.PUBLISHED}>
                  {t('instructor.quiz.status.published', {
                    fallback: 'Published',
                  })}
                </SelectItem>
                <SelectItem value={QuizStatus.DRAFT}>
                  {t('instructor.quiz.status.draft', { fallback: 'Draft' })}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={`${currentSortField}:${currentSortDir}`}
              onValueChange={(value) => {
                const [field, dir] = value.split(':') as [
                  string,
                  'ASC' | 'DESC',
                ];
                onSortChange(field, dir);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdDate:DESC">
                  {t('instructor.quiz.sort.newest', { fallback: 'Newest' })}
                </SelectItem>
                <SelectItem value="createdDate:ASC">
                  {t('instructor.quiz.sort.oldest', { fallback: 'Oldest' })}
                </SelectItem>
                <SelectItem value="title:ASC">
                  {t('instructor.quiz.sort.title.asc', {
                    fallback: 'Title A–Z',
                  })}
                </SelectItem>
                <SelectItem value="title:DESC">
                  {t('instructor.quiz.sort.title.desc', {
                    fallback: 'Title Z–A',
                  })}
                </SelectItem>
                <SelectItem value="status:ASC">
                  {t('instructor.quiz.sort.status.asc', {
                    fallback: 'Status A–Z',
                  })}
                </SelectItem>
                <SelectItem value="status:DESC">
                  {t('instructor.quiz.sort.status.desc', {
                    fallback: 'Status Z–A',
                  })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('instructor.quiz.results.summary', {
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

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {filter.search || filter.status
              ? t('instructor.quiz.no.results', {
                  fallback: 'No quizzes found matching your criteria.',
                })
              : t('instructor.quiz.no.quizzes', {
                  fallback: 'No quizzes created yet.',
                })}
          </p>
          {!filter.search && !filter.status && (
            <Button asChild className="mt-4">
              <Link href="/instructor/quizzes/new">
                <Plus className="mr-2 h-4 w-4" />
                {t('instructor.quiz.create.first', {
                  fallback: 'Create Your First Quiz',
                })}
              </Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onDelete={() => setDeleteQuizId(quiz.id)}
              onUpdateStatus={(status) => onUpdateQuizStatus(quiz.id, status)}
              isDeleting={isDeleting}
              isUpdatingStatus={isUpdatingStatus}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <QuizPagination
          currentPage={currentPage}
          totalPages={totalPages}
          isFirst={isFirst}
          isLast={isLast}
          onPageChange={onPageChange}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteQuizId}
        onOpenChange={() => setDeleteQuizId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('instructor.quiz.delete.confirm.title', {
                fallback: 'Delete Quiz',
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('instructor.quiz.delete.confirm.description', {
                fallback:
                  'Are you sure you want to delete this quiz? This action cannot be undone.',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel', { fallback: 'Cancel' })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete', { fallback: 'Delete' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
