'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useUrlFilter } from '@/components/shared/hooks/useUrlFilter';
import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';
import { FileText } from 'lucide-react';

import { ROUTES_APP } from '../routes';
import { QuizzesHeader } from './components/QuizzesHeader';
import { QuizzesListSection } from './components/QuizzesListSection';
import { useDeleteQuiz } from './hooks/useDeleteQuiz';
import { useQuizzes } from './hooks/useQuizzesQuery';
import { useUpdateQuizStatus } from './hooks/useUpdateQuizStatus';
import { QuizFilter, QuizStatus } from './types/quiz';

export function InstructorQuizzesPage() {
  const router = useRouter();
  const t = useTranslations();

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

  // Global keyboard shortcuts: N (new), / (focus search), Esc (clear search)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs or contenteditable
      const target = e.target as HTMLElement | null;
      const isTyping = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isTyping) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        router.push(ROUTES_APP.quizzes.new());
      }
      if (e.key === '/') {
        e.preventDefault();
        const el = document.getElementById('instructor-quizzes-search') as HTMLInputElement | null;
        el?.focus();
      }
      if (e.key === 'Escape') {
        const el = document.getElementById('instructor-quizzes-search') as HTMLInputElement | null;
        if (el && el.value) {
          el.value = '';
          setSearchQuery('');
          setSearch('');
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [router, setSearch]);

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

      {quizzesQuery.isError ? (
        <ContentPlaceholder
          icon={FileText}
          title={t('common.error.title', { fallback: 'Something went wrong' })}
          description={t('common.error.description', {
            fallback: 'There was a problem loading the data. Please try again.',
          })}
          actions={[
            {
              label: t('common.retry', { fallback: 'Try Again' }),
              onClick: () => quizzesQuery.refetch(),
            },
          ]}
        />
      ) : (
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
      )}
    </div>
  );
}
export default InstructorQuizzesPage;
