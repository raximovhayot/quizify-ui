'use client';

import { AlertCircle, ArrowLeft, CheckCircle2, Edit, Play } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { useUpdateQuizStatus } from '../hooks/useUpdateQuizStatus';
import { QuizDataDTO, QuizStatus } from '../types/quiz';

export interface QuizViewHeaderProps {
  quiz: QuizDataDTO;
}

export function QuizViewHeader({ quiz }: QuizViewHeaderProps) {
  const t = useTranslations();
  const router = useRouter();
  const updateStatus = useUpdateQuizStatus();

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
    <div className="space-y-4 mb-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(ROUTES_APP.quizzes.list())}
          className="p-1 h-auto shrink-0"
        >
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        <Badge
          variant={getStatusColor(quiz.status)}
          className="flex items-center gap-1 text-[11px] sm:text-sm px-2.5 sm:px-3 py-0.5 sm:py-1"
        >
          <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          {quiz.status === QuizStatus.PUBLISHED
            ? t('instructor.quiz.status.published', { fallback: 'Published' })
            : t('instructor.quiz.status.draft', { fallback: 'Draft' })}
        </Badge>
        <span className="text-xs sm:text-sm text-muted-foreground">
          ID: {quiz.id}
        </span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold break-words">
          {quiz.title ||
            t('instructor.quiz.untitled', {
              fallback: 'Untitled Quiz',
            })}
        </h1>
        <div className="hidden sm:flex sm:shrink-0 sm:items-center sm:gap-3 sm:justify-end">
          <Button
            onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}
            className="w-full sm:w-auto flex items-center gap-2 h-9 px-3 text-sm md:h-10 md:px-4 md:text-base"
          >
            <Edit className="h-4 w-4 md:h-5 md:w-5" />
            {t('instructor.quiz.action.edit', {
              fallback: 'Edit Quiz',
            })}
          </Button>
          {quiz.status === QuizStatus.DRAFT ? (
            <Button
              onClick={() =>
                updateStatus.mutate({
                  id: quiz.id,
                  status: QuizStatus.PUBLISHED,
                })
              }
              disabled={updateStatus.isPending}
              variant="default"
              className="w-full sm:w-auto flex items-center gap-2 h-9 px-3 text-sm md:h-10 md:px-4 md:text-base"
            >
              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
              {updateStatus.isPending
                ? t('common.updating', { fallback: 'Updating...' })
                : t('instructor.quiz.action.publish', { fallback: 'Publish' })}
            </Button>
          ) : (
            <Button
              onClick={() => {
                // TODO: Implement start quiz functionality
                console.log('Starting quiz:', quiz.id);
              }}
              variant="default"
              className="w-full sm:w-auto flex items-center gap-2 h-9 px-3 text-sm md:h-10 md:px-4 md:text-base"
            >
              <Play className="h-4 w-4 md:h-5 md:w-5" />
              {t('instructor.quiz.action.start', {
                fallback: 'Start',
              })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
