'use client';

import { Search } from 'lucide-react';

import React, { useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';
import { AppPagination } from '@/components/shared/ui/AppPagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { QuizGrid } from './components/QuizGrid';
import { QuizListSkeleton } from './components/QuizListSkeleton';
import {
  useDeleteQuiz,
  useQuizzes,
  useUpdateQuizStatus,
} from './hooks/useQuizzes';
import { QuizStatus } from './types/quiz';

export function InstructorQuizzesPage() {
  const t = useTranslations();
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
    <div className="space-y-4">
      {/* Content */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-medium">
              {t('instructor.quiz.list.title', { fallback: 'Your quizzes' })}
            </CardTitle>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="flex-1 sm:w-[320px]"
              >
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
              <Button
                onClick={() =>
                  router.push(`${ROUTES_APP.baseUrl()}/quizzes/new`)
                }
              >
                {t('instructor.quiz.create.button', {
                  fallback: 'Create Quiz',
                })}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {quizzesQuery.isLoading ? (
            <QuizListSkeleton />
          ) : (
            <>
              <QuizGrid
                quizzes={quizzesQuery.data?.content || []}
                onDelete={(id: number) => deleteQuiz.mutate(id)}
                onUpdateStatus={(id: number, status: QuizStatus) =>
                  updateStatus.mutate({ id, status })
                }
                isDeleting={deleteQuiz.isPending}
                isUpdatingStatus={updateStatus.isPending}
              />

              <AppPagination
                currentPage={quizzesQuery.data?.page || 0}
                totalPages={quizzesQuery.data?.totalPages || 0}
                onPageChange={(p) => setPage(p)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default InstructorQuizzesPage;
