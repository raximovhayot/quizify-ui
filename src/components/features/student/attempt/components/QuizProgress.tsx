'use client';

import { useTranslations } from 'next-intl';

import { Progress } from '@/components/ui/progress';

interface QuizProgressProps {
  totalQuestions: number;
  answeredQuestions: number;
}

export function QuizProgress({
  totalQuestions,
  answeredQuestions,
}: QuizProgressProps) {
  const t = useTranslations();
  const percentage = (answeredQuestions / totalQuestions) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t('student.attempt.progress', { fallback: 'Progress' })}
        </span>
        <span className="font-medium">
          {answeredQuestions} / {totalQuestions}{' '}
          {t('student.attempt.answered', { fallback: 'answered' })}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
