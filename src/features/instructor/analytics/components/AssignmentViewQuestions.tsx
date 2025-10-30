'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppPagination } from '@/components/shared/ui/AppPagination';

import { useAssignmentQuestions } from '../hooks';
import {
  QuestionsDisplayList,
  QuestionsDisplayHeader,
} from '@/features/instructor/shared/components/questions';

interface AssignmentViewQuestionsProps {
  assignmentId: number;
}

export function AssignmentViewQuestions({
  assignmentId,
}: Readonly<AssignmentViewQuestionsProps>) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlPageParam = parseInt(searchParams?.get('qpage') ?? '1', 10);
  const initialPage = Number.isFinite(urlPageParam) && urlPageParam > 0 ? urlPageParam - 1 : 0;
  const [page, setPage] = useState(initialPage);
  const { data, isLoading, error, refetch } = useAssignmentQuestions(assignmentId, page, 10);
  const [showAnswers, setShowAnswers] = useState(false);

  const updateSearchParam = useCallback((key: string, value?: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (value === undefined || value === '' || value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Sync from URL (back/forward navigation)
  useEffect(() => {
    const qp = parseInt(searchParams?.get('qpage') ?? '1', 10);
    const zero = Number.isFinite(qp) && qp > 0 ? qp - 1 : 0;
    setPage((prev) => (prev !== zero ? zero : prev));
  }, [searchParams]);

  // Clamp page when data loads and page is out of range
  useEffect(() => {
    if (!data) return;
    const tp = data.totalPages ?? 1;
    if (tp > 0 && page > tp - 1) {
      const clamped = tp - 1;
      setPage(clamped);
      updateSearchParam('qpage', String(clamped + 1));
    }
  }, [data, page, updateSearchParam]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('instructor.assignment.questions.loading', {
                fallback: 'Loading questions...',
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t('common.error.title', {
                fallback: 'Something went wrong',
              })}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('common.error.description', {
                fallback:
                  'There was a problem loading the data. Please try again.',
              })}
            </p>
            <Button onClick={() => refetch()}>
              {t('common.retry', { fallback: 'Try Again' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const questionsList = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Map QuestionDataDto items directly for display
  const displayQuestions = questionsList.map((q, idx) => ({
    id: q.id,
    quizId: 0, // Not needed for display
    content: q.content,
    questionType: q.questionType,
    points: q.points,
    order: q.order ?? idx,
    explanation: q.explanation ?? '',
    answers: q.answers ?? [],
  }));

  return (
    <div className="space-y-6">
      <QuestionsDisplayHeader
        count={total}
        title={t('instructor.assignment.questions.title', {
          fallback: 'Questions',
        })}
        subtitle={total > 0
          ? `${t('common.page', { fallback: 'Page' })} ${page + 1} ${t('common.of', { fallback: 'of' })} ${totalPages}`
          : t('instructor.assignment.questions.empty', { fallback: 'No questions available' })}
        showAnswers={showAnswers}
        onToggleShowAnswers={() => setShowAnswers(!showAnswers)}
      />
      
      <QuestionsDisplayList
        questions={displayQuestions}
        showAnswers={showAnswers}
        showOrder={true}
        emptyTitle={t('instructor.assignment.questions.empty', {
          fallback: 'No questions available',
        })}
        emptyDescription=""
      />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <AppPagination
          className="mt-2"
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            setPage(p);
            updateSearchParam('qpage', String(p + 1));
          }}
          showInfo
        />
      )}
    </div>
  );
}
