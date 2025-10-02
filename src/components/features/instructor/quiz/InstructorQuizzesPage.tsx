'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useUrlFilter } from '@/components/shared/hooks/useUrlFilter';

import { ROUTES_APP } from '../routes';
import { QuizzesHeader } from './components/QuizzesHeader';
import { QuizzesListSection } from './components/QuizzesListSection';
import { useDeleteQuiz } from './hooks/useDeleteQuiz';
import { useQuizzes } from './hooks/useQuizzesQuery';
import { useUpdateQuizStatus } from './hooks/useUpdateQuizStatus';
import { QuizFilter, QuizStatus } from './types/quiz';

export function InstructorQuizzesPage() {
  const router = useRouter();

  // Use URL-based state management
  const { filter, setPage, setSearch } = useUrlFilter<QuizFilter>({
    defaultSize: 10,
    parseFilter: (params) => ({
      status: params.get('status') as QuizStatus | undefined,
    }),
  });

  // Local state for search input (before debounce)
  const [searchQuery, setSearchQuery] = useState(filter.search || '');

  // Sync searchQuery with URL filter
  useEffect(() => {
    setSearchQuery(filter.search || '');
  }, [filter.search]);

  // Debounce search input
  useEffect(() => {
    const trimmed = (searchQuery || '').trim();
    if (trimmed === (filter.search || '')) return;
    const id = setTimeout(() => {
      setSearch(trimmed);
    }, 400);
    return () => clearTimeout(id);
  }, [searchQuery, filter.search, setSearch]);

  const quizzesQuery = useQuizzes(filter);
  const deleteQuiz = useDeleteQuiz();
  const updateStatus = useUpdateQuizStatus();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = (searchQuery || '').trim();
    setSearch(trimmed);
  };

  return (
    <div className="space-y-6">
      <QuizzesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onCreate={() => router.push(ROUTES_APP.quizzes.new())}
      />

      <QuizzesListSection
        loading={quizzesQuery.isLoading}
        quizzes={quizzesQuery.data?.content}
        onDelete={(id: number) => deleteQuiz.mutate(id)}
        onUpdateStatus={(id: number, status: QuizStatus) =>
          updateStatus.mutate({ id, status })
        }
        searchQuery={filter.search || ''}
        isDeleting={deleteQuiz.isPending}
        isUpdatingStatus={updateStatus.isPending}
        currentPage={quizzesQuery.data?.page || 0}
        totalPages={quizzesQuery.data?.totalPages || 0}
        onPageChange={setPage}
      />
    </div>
  );
}

export default InstructorQuizzesPage;
