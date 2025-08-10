'use client';

import { useCallback, useEffect, useMemo } from 'react';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ErrorDisplay } from '@/components/shared/ui/ErrorDisplay';

import {
  useDeleteQuiz,
  useQuizzes,
  useUpdateQuizStatus,
} from '../hooks/useQuizzes';
import { QuizFilter, QuizStatus } from '../types/quiz';
import { QuizList } from './QuizList';
import { QuizListSkeleton } from './QuizListSkeleton';

export interface QuizListContainerProps {
  className?: string;
}

export function QuizListContainer({ className }: QuizListContainerProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const {
    data: quizzesResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuizzes(filter);

  // Normalize page in URL based on backend response to avoid out-of-range pages
  useEffect(() => {
    if (!quizzesResponse) return;

    const backendPage = quizzesResponse.page;
    const total = quizzesResponse.totalPages;

    // Determine the desired page within valid bounds
    let desiredPage = 0;
    if (total > 0) {
      desiredPage = Math.min(total - 1, Math.max(0, backendPage));
    }

    // If the URL-derived page differs from the backend (or is out of bounds), sync it
    if (filter.page !== desiredPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', desiredPage.toString());
      updateUrl(params, 'replace');
    }
  }, [quizzesResponse, filter.page, searchParams, updateUrl]);

  const deleteQuizMutation = useDeleteQuiz();
  const updateQuizStatusMutation = useUpdateQuizStatus();

  const handleDeleteQuiz = async (quizId: number) => {
    try {
      await deleteQuizMutation.mutateAsync(quizId);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to delete quiz:', error);
    }
  };

  const handleUpdateQuizStatus = async (quizId: number, status: QuizStatus) => {
    try {
      await updateQuizStatusMutation.mutateAsync({ id: quizId, status });
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to update quiz status:', error);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  if (isLoading || (isFetching && !quizzesResponse)) {
    return <QuizListSkeleton className={className} />;
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={handleRetry}
        title={t('instructor.quiz.list.error.title')}
        description={t('instructor.quiz.list.error.description')}
      />
    );
  }

  if (!quizzesResponse) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">
          {t('instructor.quiz.list.no.data')}
        </p>
      </div>
    );
  }

  return (
    <QuizList
      quizzes={quizzesResponse.content}
      totalElements={quizzesResponse.totalElements}
      totalPages={quizzesResponse.totalPages}
      currentPage={quizzesResponse.page}
      pageSize={quizzesResponse.size}
      isFirst={quizzesResponse.page === 0}
      isLast={quizzesResponse.page === quizzesResponse.totalPages - 1}
      filter={filter}
      onSearch={handleSearch}
      onStatusFilter={handleStatusFilter}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onDeleteQuiz={handleDeleteQuiz}
      onUpdateQuizStatus={handleUpdateQuizStatus}
      isDeleting={deleteQuizMutation.isPending}
      isUpdatingStatus={updateQuizStatusMutation.isPending}
      className={className}
    />
  );
}
