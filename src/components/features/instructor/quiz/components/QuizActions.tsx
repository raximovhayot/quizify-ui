'use client';

import { memo, useCallback } from 'react';

import { useTranslations } from 'next-intl';

import { QuizDataDTO, QuizStatus } from '../types/quiz';

export interface QuizActionsProps {
  quiz: QuizDataDTO;
  onDelete: (quizId: number) => void;
  onUpdateStatus: (quizId: number, status: QuizStatus) => void;
  isDeleting?: boolean;
  isUpdatingStatus?: boolean;
  className?: string;
}

export const QuizActions = memo(function QuizActions({
  quiz,
  onDelete,
  onUpdateStatus,
  isDeleting = false,
  isUpdatingStatus = false,
  className,
}: Readonly<QuizActionsProps>) {
  const t = useTranslations();

  const handleDelete = useCallback(() => {
    if (
      window.confirm(
        t('instructor.quiz.delete.confirm', {
          fallback: 'Are you sure you want to delete this quiz?',
        })
      )
    ) {
      onDelete(quiz.id);
    }
  }, [quiz.id, onDelete, t]);

  const handleStatusToggle = useCallback(() => {
    const newStatus =
      quiz.status === QuizStatus.PUBLISHED
        ? QuizStatus.DRAFT
        : QuizStatus.PUBLISHED;
    onUpdateStatus(quiz.id, newStatus);
  }, [quiz.id, quiz.status, onUpdateStatus]);

  const isLoading = isDeleting || isUpdatingStatus;

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <button
        onClick={handleStatusToggle}
        disabled={isLoading}
        className="text-sm text-primary hover:underline disabled:opacity-50"
        aria-label={
          quiz.status === QuizStatus.PUBLISHED
            ? t('instructor.quiz.action.unpublish', { fallback: 'Unpublish' })
            : t('instructor.quiz.action.publish', { fallback: 'Publish' })
        }
      >
        {quiz.status === QuizStatus.PUBLISHED
          ? t('instructor.quiz.action.unpublish', { fallback: 'Unpublish' })
          : t('instructor.quiz.action.publish', { fallback: 'Publish' })}
      </button>
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="text-sm text-destructive hover:underline disabled:opacity-50"
        aria-label={t('common.delete', { fallback: 'Delete' })}
      >
        {t('common.delete', { fallback: 'Delete' })}
      </button>
    </div>
  );
});
