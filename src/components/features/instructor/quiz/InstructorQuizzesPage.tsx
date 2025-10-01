'use client';

import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { useUrlFilter } from '@/components/shared/hooks/useUrlFilter';
import { ErrorDisplay } from '@/components/shared/ui/ErrorDisplay';

import { ROUTES_APP } from '../routes';
import { QuizzesContent } from './components/QuizzesContent';
import { useDeleteQuiz } from './hooks/useDeleteQuiz';
import { useQuizzes } from './hooks/useQuizzesQuery';
import { useUpdateQuizStatus } from './hooks/useUpdateQuizStatus';
import { QuizFilter, QuizStatus } from './types/quiz';

export function InstructorQuizzesPage() {
  const router = useRouter();

  // Use shared URL filter hook
  const { filter, setPage, setSize, setSearch, updateFilter } =
    useUrlFilter<QuizFilter>({
      defaultSize: 10,
      parseFilter: (params) => ({
        status: params.get('status') as QuizStatus | undefined,
      }),
    });

  // Filter handlers
  const onStatusFilter = useCallback(
    (status: QuizStatus | undefined) => {
      updateFilter({ status, page: 0 });
    },
    [updateFilter]
  );

  // Data fetching
  const quizzesQuery = useQuizzes(filter);
  const deleteQuiz = useDeleteQuiz();
  const updateStatus = useUpdateQuizStatus();

  // Error state
  if (quizzesQuery.error) {
    return (
      <div className="p-6">
        <ErrorDisplay
          error={quizzesQuery.error}
          onRetry={() => quizzesQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <QuizzesContent
      data={quizzesQuery.data}
      isLoading={quizzesQuery.isLoading}
      isFetching={quizzesQuery.isFetching}
      filter={filter}
      onSearch={setSearch}
      onStatusFilter={onStatusFilter}
      onPageChange={setPage}
      onPageSizeChange={setSize}
      onCreate={() => router.push(ROUTES_APP.quizzes.new())}
      onDelete={(id: number) => deleteQuiz.mutate(id)}
      onUpdateStatus={(id: number, status: QuizStatus) =>
        updateStatus.mutate({ id, status })
      }
      isDeleting={deleteQuiz.isPending}
      isUpdatingStatus={updateStatus.isPending}
    />
  );
}

export default InstructorQuizzesPage;
