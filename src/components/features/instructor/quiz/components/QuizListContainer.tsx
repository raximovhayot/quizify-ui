'use client';

import { useCallback, useEffect, useMemo } from 'react';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useErrorRecovery } from '@/components/shared/hooks/useErrorRecovery';
import { ErrorDisplay } from '@/components/shared/ui/ErrorDisplay';

import {
  useDeleteQuiz,
  useQuizzes,
  useUpdateQuizStatus,
} from '../hooks/useQuizzes';
import { QuizFilter, QuizStatus } from '../types/quiz';
import { QuizFilters } from './QuizFilters';
import { QuizGrid } from './QuizGrid';
import { QuizListControls } from './QuizListControls';
import { QuizListSkeleton } from './QuizListSkeleton';
import { QuizPagination } from './QuizPagination';

export interface QuizListContainerProps {
  className?: string;
}

export function QuizListContainer({ className }: QuizListContainerProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse URL parameters into filter object
  const filter: QuizFilter = useMemo(() => {
    const pageParam = searchParams.get('page');
    const sizeParam = searchParams.get('size');
    const s = searchParams.get('search') || undefined;
    const statusParam = searchParams.get('status') as QuizStatus | null;

    const page = pageParam ? Math.max(0, parseInt(pageParam, 10) || 0) : 0;
    const size = sizeParam
      ? Math.min(100, Math.max(1, parseInt(sizeParam, 10) || 10))
      : 10;

    let status: QuizStatus | undefined;
    if (
      statusParam === QuizStatus.PUBLISHED ||
      statusParam === QuizStatus.DRAFT
    ) {
      status = statusParam;
    }

    return { page, size, search: s, status };
  }, [searchParams]);

  // URL update utility
  const updateUrl = useCallback(
    (params: URLSearchParams, method: 'push' | 'replace' = 'push') => {
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      if (method === 'replace') {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [pathname, router]
  );

  // Filter handlers
  const handleSearch = useCallback(
    (search: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (search && search.trim()) {
        params.set('search', search.trim());
      } else {
        params.delete('search');
      }
      params.set('page', '0');
      updateUrl(params, 'replace');
    },
    [searchParams, updateUrl]
  );

  const handleStatusFilter = useCallback(
    (status: QuizStatus | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (status) {
        params.set('status', status);
      } else {
        params.delete('status');
      }
      params.set('page', '0');
      updateUrl(params, 'push');
    },
    [searchParams, updateUrl]
  );

  // Pagination handlers
  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', Math.max(0, page).toString());
      updateUrl(params, 'push');
    },
    [searchParams, updateUrl]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('size', Math.max(1, Math.min(100, size)).toString());
      params.set('page', '0');
      updateUrl(params, 'push');
    },
    [searchParams, updateUrl]
  );

  // Data fetching
  const {
    data: quizzesResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuizzes(filter);

  // Enhanced error recovery
  const {
    execute: retryFetch,
    isRetrying,
    retryCount,
  } = useErrorRecovery(
    async () => {
      await refetch();
    },
    {
      maxRetries: 3,
      retryDelay: 1000,
      onError: (error) => {
        console.warn('Quiz fetch failed:', error);
      },
      onMaxRetriesReached: (error) => {
        console.error('Max retries reached for quiz fetch:', error);
      },
    }
  );

  // Normalize page in URL based on backend response
  useEffect(() => {
    if (!quizzesResponse) return;

    const backendPage = quizzesResponse.page;
    const total = quizzesResponse.totalPages;

    let desiredPage = 0;
    if (total > 0) {
      desiredPage = Math.min(total - 1, Math.max(0, backendPage));
    }

    if (filter.page !== desiredPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', desiredPage.toString());
      updateUrl(params, 'replace');
    }
  }, [quizzesResponse, filter.page, searchParams, updateUrl]);

  // Mutations
  const deleteQuizMutation = useDeleteQuiz();
  const updateQuizStatusMutation = useUpdateQuizStatus();

  const handleDeleteQuiz = useCallback(
    async (quizId: number) => {
      try {
        await deleteQuizMutation.mutateAsync(quizId);
      } catch (error) {
        console.error('Failed to delete quiz:', error);
      }
    },
    [deleteQuizMutation]
  );

  const handleUpdateQuizStatus = useCallback(
    async (quizId: number, status: QuizStatus) => {
      try {
        await updateQuizStatusMutation.mutateAsync({ id: quizId, status });
      } catch (error) {
        console.error('Failed to update quiz status:', error);
      }
    },
    [updateQuizStatusMutation]
  );

  // Loading state
  if (isLoading || (isFetching && !quizzesResponse)) {
    return <QuizListSkeleton className={className} />;
  }

  // Error state
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={retryFetch}
        title={t('instructor.quiz.list.error.title', {
          fallback: 'Failed to load quizzes',
        })}
        description={t('instructor.quiz.list.error.description', {
          fallback: 'Please try again.',
        })}
      />
    );
  }

  // No data state
  if (!quizzesResponse) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">
          {t('instructor.quiz.list.no.data', { fallback: 'No quizzes found' })}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Filters */}
      <QuizFilters
        filter={filter}
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
      />

      {/* Results count and page size control */}
      <QuizListControls
        totalElements={quizzesResponse.totalElements}
        pageSize={quizzesResponse.size}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Quiz grid */}
      <QuizGrid
        quizzes={quizzesResponse.content}
        onDelete={handleDeleteQuiz}
        onUpdateStatus={handleUpdateQuizStatus}
        isDeleting={deleteQuizMutation.isPending}
        isUpdatingStatus={updateQuizStatusMutation.isPending}
      />

      {/* Pagination */}
      {quizzesResponse.totalPages > 1 && (
        <QuizPagination
          currentPage={quizzesResponse.page}
          totalPages={quizzesResponse.totalPages}
          onPageChange={handlePageChange}
          isFirst={quizzesResponse.page === 0}
          isLast={quizzesResponse.page === quizzesResponse.totalPages - 1}
        />
      )}
    </div>
  );
}
