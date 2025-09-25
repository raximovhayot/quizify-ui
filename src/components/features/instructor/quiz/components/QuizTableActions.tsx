'use client';

import { Edit, Eye, FileText, MoreHorizontal, Trash2 } from 'lucide-react';

import { memo } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { QuizDataDTO, QuizStatus } from '../types/quiz';

export interface QuizTableActionsProps {
  quiz: QuizDataDTO;
  onDelete: (quizId: number) => void;
  onUpdateStatus: (quizId: number, status: QuizStatus) => void;
  isDeleting?: boolean;
  isUpdatingStatus?: boolean;
}

function QuizTableActionsComponent({
  quiz,
  onDelete,
  onUpdateStatus,
  isDeleting = false,
  isUpdatingStatus = false,
}: Readonly<QuizTableActionsProps>) {
  const t = useTranslations();
  const router = useRouter();

  const handleStatusToggle = () => {
    const newStatus =
      quiz.status === QuizStatus.PUBLISHED
        ? QuizStatus.DRAFT
        : QuizStatus.PUBLISHED;
    onUpdateStatus(quiz.id, newStatus);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        t('instructor.quiz.delete.confirm', {
          fallback: 'Are you sure you want to delete this quiz?',
        })
      )
    ) {
      onDelete(quiz.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={isDeleting || isUpdatingStatus}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">
            {t('common.actions', { fallback: 'Actions' })}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(ROUTES_APP.quizzes.detail(quiz.id))}
        >
          <Eye className="mr-2 h-4 w-4" />
          {t('instructor.quiz.action.view', { fallback: 'View' })}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}
        >
          <Edit className="mr-2 h-4 w-4" />
          {t('instructor.quiz.action.edit', { fallback: 'Edit' })}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleStatusToggle}>
          {quiz.status === QuizStatus.PUBLISHED ? (
            <>
              <FileText className="mr-2 h-4 w-4" />
              {t('instructor.quiz.action.unpublish', {
                fallback: 'Unpublish',
              })}
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              {t('instructor.quiz.action.publish', {
                fallback: 'Publish',
              })}
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t('instructor.quiz.action.delete', { fallback: 'Delete' })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const QuizTableActions = memo(QuizTableActionsComponent);
