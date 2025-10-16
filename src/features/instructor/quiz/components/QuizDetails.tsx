'use client';

import { useTranslations } from 'next-intl';

import { QuizDataDTO } from '../types/quiz';

export interface QuizDetailsProps {
  quiz: QuizDataDTO;
}

export function QuizDetails({ quiz }: QuizDetailsProps) {
  const t = useTranslations();

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight">
        {quiz.title || t('instructor.quiz.untitled', { fallback: 'Untitled' })}
      </h1>
      {quiz.description && (
        <p className="text-muted-foreground leading-relaxed">
          {quiz.description}
        </p>
      )}
    </div>
  );
}
