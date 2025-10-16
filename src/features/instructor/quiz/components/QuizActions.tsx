'use client';

import { memo, useCallback, useState } from 'react';

import { useTranslations } from 'next-intl';

import { QuizDataDTO, QuizStatus } from '../types/quiz';
import { DeleteQuizDialog } from './DeleteQuizDialog';

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
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = useCallback(() => {
    setDeleteOpen(true);
  }, []);

  const handleStatusToggle = useCallback(() => {
    const newStatus =
      quiz.status === QuizStatus.PUBLISHED
        ? QuizStatus.DRAFT
        : QuizStatus.PUBLISHED;
    onUpdateStatus(quiz.id, newStatus);
  }, [quiz.id, quiz.status, onUpdateStatus]);

  const isLoading = isDeleting || isUpdatingStatus;

  return (
    <>
      <div className={`flex items-center gap-2 ${className || ''}`}>
        <button
          onClick={handleStatusToggle}
          disabled={isLoading}
          className="text-sm text-primary hover:underline disabled:opacity-50"
          aria-label={
            quiz.status === QuizStatus.PUBLISHED
              ? t('common.unpublish', { fallback: 'Unpublish' })
              : t('common.publish', { fallback: 'Publish' })
          }
        >
          {quiz.status === QuizStatus.PUBLISHED
            ? t('common.unpublish', { fallback: 'Unpublish' })
            : t('common.publish', { fallback: 'Publish' })}
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

      <DeleteQuizDialog
        open={deleteOpen}
        isSubmitting={!!isDeleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDelete(quiz.id);
          setDeleteOpen(false);
        }}
      />
    </>
  );
});
