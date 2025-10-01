'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';

import { QuizDataDTO, QuizStatus } from '../types/quiz';

export interface QuizHeaderProps {
  quiz: QuizDataDTO;
}

export function QuizHeader({ quiz }: QuizHeaderProps) {
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

  const getStatusLabel = (status: QuizStatus) => {
    switch (status) {
      case QuizStatus.PUBLISHED:
        return t('common.published', { fallback: 'Published' });
      case QuizStatus.DRAFT:
        return t('common.draft', { fallback: 'Draft' });
      default:
        return status;
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Badge
        variant={getStatusColor(quiz.status)}
        className="text-sm px-3 py-1"
      >
        {getStatusLabel(quiz.status)}
      </Badge>
      <span className="text-sm text-muted-foreground">
        {t('instructor.quiz.view.id', { fallback: 'ID: {id}', id: quiz.id })}
      </span>
    </div>
  );
}
