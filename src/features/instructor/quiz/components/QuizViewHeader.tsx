'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';

import { QuizDataDTO, QuizStatus } from '../types/quiz';

export interface QuizViewHeaderProps {
  quiz: QuizDataDTO;
}

export function QuizViewHeader({ quiz }: QuizViewHeaderProps) {
  const t = useTranslations();

  const getStatusColor = (status: QuizStatus) => {
    switch (status) {
      case QuizStatus.PUBLISHED:
        return 'default';
      case QuizStatus.DRAFT:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: QuizStatus) => {
    switch (status) {
      case QuizStatus.PUBLISHED:
        return CheckCircle2;
      case QuizStatus.DRAFT:
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  const StatusIcon = getStatusIcon(quiz.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          variant={getStatusColor(quiz.status)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5"
          title={
            quiz.status === QuizStatus.PUBLISHED
              ? t('instructor.quiz.status.tooltip.published', {
                  fallback:
                    'This quiz is published; you can start it and it will be visible to students.',
                })
              : t('instructor.quiz.status.tooltip.draft', {
                  fallback: 'This quiz is a draft and hidden from students.',
                })
          }
        >
          <StatusIcon className="h-4 w-4" />
          {quiz.status === QuizStatus.PUBLISHED
            ? t('common.published', { fallback: 'Published' })
            : t('common.draft', { fallback: 'Draft' })}
        </Badge>
        <span className="text-sm text-muted-foreground">{t('instructor.quiz.view.id', { fallback: 'ID: {id}', id: quiz.id })}</span>
      </div>
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight break-words">
          {quiz.title ||
            t('instructor.quiz.untitled', {
              fallback: 'Untitled Quiz',
            })}
        </h1>
        {quiz.description ? (
          <p className="mt-2 text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {quiz.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
