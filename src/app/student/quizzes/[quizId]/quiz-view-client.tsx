'use client';

import { Loader2 } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { QuizView } from '@/features/student/quiz/components/QuizView';
import { useStudentQuiz } from '@/features/student/quiz/hooks/useStudentQuiz';

export function QuizViewClient({ quizId }: { quizId: number }) {
  const t = useTranslations();
  const assignmentQuery = useStudentQuiz(quizId);

  const isLoading = assignmentQuery.isLoading;
  const isError = assignmentQuery.isError;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t('common.loading', { default: 'Loading...' })}
      </div>
    );
  }

  if (isError || !assignmentQuery.data) {
    return (
      <div className="text-destructive">
        {t('student.quiz.loadError', { default: 'Failed to load quiz' })}
      </div>
    );
  }

  // Note: This component needs refactoring - Assignment data structure doesn't match QuizDataDTO
  return (
    <div className="text-muted-foreground">
      {t('student.quiz.viewNotImplemented', { default: 'Quiz view is being updated' })}
    </div>
  );
}
