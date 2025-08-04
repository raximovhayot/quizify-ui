'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { ErrorDisplay } from '@/components/shared/ui/ErrorDisplay';
import { LoadingSpinner } from '@/components/shared/ui/LoadingSpinner';

import {
  useDeleteQuiz,
  useQuizzes,
  useUpdateQuizStatus,
} from '../hooks/useQuizzes';
import { QuizFilter, QuizStatus } from '../types/quiz';
import { QuizList } from './QuizList';

export interface QuizListContainerProps {
  className?: string;
}

export function QuizListContainer({ className }: QuizListContainerProps) {
  const t = useTranslations();
  const [filter, setFilter] = useState<QuizFilter>({
    page: 0,
    size: 10,
  });

  const {
    data: quizzesResponse,
    isLoading,
    error,
    refetch,
  } = useQuizzes(filter);

  const deleteQuizMutation = useDeleteQuiz();
  const updateQuizStatusMutation = useUpdateQuizStatus();

  const handleSearch = (search: string) => {
    setFilter((prev) => ({
      ...prev,
      search: search || undefined,
      page: 0, // Reset to first page when searching
    }));
  };

  const handleStatusFilter = (status: QuizStatus | undefined) => {
    setFilter((prev) => ({
      ...prev,
      status,
      page: 0, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilter((prev) => ({
      ...prev,
      page,
    }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilter((prev) => ({
      ...prev,
      size,
      page: 0, // Reset to first page when changing page size
    }));
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={handleRetry}
        title={t('instructor.quiz.list.error.title', {
          fallback: 'Failed to load quizzes',
        })}
        description={t('instructor.quiz.list.error.description', {
          fallback:
            'There was an error loading your quizzes. Please try again.',
        })}
      />
    );
  }

  if (!quizzesResponse) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">
          {t('instructor.quiz.list.no.data', {
            fallback: 'No quiz data available',
          })}
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
