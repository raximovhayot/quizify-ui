'use client';

import { FileText } from 'lucide-react';

import { memo } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';

import { QuizDataDTO, QuizStatus } from '../types/quiz';
import { QuizActions } from './QuizActions';
import { QuizCard } from './QuizCard';

export interface QuizGridProps {
  quizzes: QuizDataDTO[];
  onDelete: (quizId: number) => void;
  onUpdateStatus: (quizId: number, status: QuizStatus) => void;
  isDeleting?: boolean;
  isUpdatingStatus?: boolean;
  className?: string;
}

export const QuizGrid = memo(function QuizGrid({
  quizzes,
  onDelete,
  onUpdateStatus,
  isDeleting = false,
  isUpdatingStatus = false,
  className,
}: QuizGridProps) {
  const t = useTranslations();
  const router = useRouter();

  if (quizzes.length === 0) {
    return (
      <ContentPlaceholder
        icon={FileText}
        title={t('instructor.quiz.list.empty', {
          fallback: 'No quizzes found',
        })}
        description={t('instructor.quiz.list.empty.description', {
          fallback: 'Create your first quiz to get started',
        })}
        actions={[
          {
            label: t('instructor.quiz.create', { fallback: 'Create Quiz' }),
            onClick: () => router.push('/instructor/quizzes/new'),
            variant: 'default',
          },
        ]}
        className={className}
      />
    );
  }

  return (
    <div className={`grid gap-4 ${className || ''}`}>
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz}>
          <QuizActions
            quiz={quiz}
            onDelete={onDelete}
            onUpdateStatus={onUpdateStatus}
            isDeleting={isDeleting}
            isUpdatingStatus={isUpdatingStatus}
          />
        </QuizCard>
      ))}
    </div>
  );
});
