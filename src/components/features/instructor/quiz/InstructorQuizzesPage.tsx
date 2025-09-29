'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';

import { QuizzesHeader } from './components/QuizzesHeader';
import { QuizzesListSection } from './components/QuizzesListSection';
import { useDeleteQuiz } from './hooks/useDeleteQuiz';
import { useQuizzes } from './hooks/useQuizzesQuery';
import { useUpdateQuizStatus } from './hooks/useUpdateQuizStatus';
import { QuizStatus } from './types/quiz';

export function InstructorQuizzesPage() {
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState(''); // debounced value used in API filter
  const [searchQuery, setSearchQuery] = useState(''); // input value

  // Debounce search input
  useEffect(() => {
    const trimmed = (searchQuery || '').trim();
    if (trimmed === (search || '')) return;
    const id = setTimeout(() => {
      setPage(0);
      setSearch(trimmed);
    }, 400);
    return () => clearTimeout(id);
  }, [searchQuery, search]);

  const filter = useMemo(
    () => ({ page, size, search: search || undefined }),
    [page, size, search]
  );

  const quizzesQuery = useQuizzes(filter);
  const deleteQuiz = useDeleteQuiz();
  const updateStatus = useUpdateQuizStatus();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = (searchQuery || '').trim();
    setPage(0);
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
        searchQuery={search}
        isDeleting={deleteQuiz.isPending}
        isUpdatingStatus={updateStatus.isPending}
        currentPage={quizzesQuery.data?.page || 0}
        totalPages={quizzesQuery.data?.totalPages || 0}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}

export default InstructorQuizzesPage;
