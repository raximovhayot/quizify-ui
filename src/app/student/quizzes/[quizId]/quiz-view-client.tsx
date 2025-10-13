'use client';

import { Loader2 } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { QuizView } from '@/components/features/student/quiz/components/QuizView';
import { useStudentQuiz } from '@/components/features/student/quiz/hooks/useStudentQuiz';

export function QuizViewClient({ quizId }: { quizId: number }) {
  const t = useTranslations();
  const { quizQuery, questionsQuery } = useStudentQuiz(quizId);

  const isLoading = quizQuery.isLoading || questionsQuery.isLoading;
  const isError = quizQuery.isError || questionsQuery.isError;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t('common.loading', { default: 'Loading...' })}
      </div>
    );
  }

  if (isError || !quizQuery.data || !questionsQuery.data) {
    return (
      <div className="text-destructive">
        {t('student.quiz.loadError', { default: 'Failed to load quiz' })}
      </div>
    );
  }

  return <QuizView quiz={quizQuery.data} questions={questionsQuery.data} />;
}
