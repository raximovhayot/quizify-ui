'use client';

import { AlertCircle, ArrowLeft, CheckCircle2, Edit, Play } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { QuizDataDTO, QuizStatus } from '../types/quiz';

export interface QuizViewHeaderProps {
  quiz: QuizDataDTO;
}

export function QuizViewHeader({ quiz }: QuizViewHeaderProps) {
  const t = useTranslations();
  const router = useRouter();

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
          className="p-1 h-auto"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Badge
          variant={getStatusColor(quiz.status)}
          className="flex items-center gap-1"
        >
          <StatusIcon className="h-3 w-3" />
          {quiz.status === QuizStatus.PUBLISHED
            ? t('instructor.quiz.status.published', { fallback: 'Published' })
            : t('instructor.quiz.status.draft', { fallback: 'Draft' })}
        </Badge>
        <span className="text-sm text-muted-foreground">ID: {quiz.id}</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {quiz.title ||
            t('instructor.quiz.untitled', {
              fallback: 'Untitled Quiz',
            })}
        </h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            {t('instructor.quiz.action.edit', {
              fallback: 'Edit Quiz',
            })}
          </Button>
          {quiz.status === QuizStatus.DRAFT ? (
            <Button
              onClick={() => {
                // TODO: Implement publish functionality
                console.log('Publishing quiz:', quiz.id);
              }}
              variant="default"
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {t('instructor.quiz.action.publish', {
                fallback: 'Publish',
              })}
            </Button>
          ) : (
            <Button
              onClick={() => {
                // TODO: Implement start quiz functionality
                console.log('Starting quiz:', quiz.id);
              }}
              variant="default"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
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
