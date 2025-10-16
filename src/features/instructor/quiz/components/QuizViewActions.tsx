'use client';

import { CheckCircle2, Edit, Play } from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/features/instructor/routes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useUpdateQuizStatus } from '../hooks/useUpdateQuizStatus';
import { QuizDataDTO, QuizStatus } from '../types/quiz';
import { AssignmentDialog } from './AssignmentDialog';

export interface QuizViewActionsProps {
  quiz: QuizDataDTO;
}

export function QuizViewActions({ quiz }: Readonly<QuizViewActionsProps>) {
  const t = useTranslations();
  const router = useRouter();
  const updateStatus = useUpdateQuizStatus();
  const [startQuizDialogOpen, setStartQuizDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('instructor.quiz.view.actions.title', {
              fallback: 'Actions',
            })}
          </CardTitle>
          <CardDescription>
            {t('instructor.quiz.view.actions.description', {
              fallback: 'Manage your quiz',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
              size="lg"
            >
              <Edit className="h-4 w-4" />
              {t('common.edit', {
                fallback: 'Edit',
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
                className="w-full flex items-center justify-center gap-2"
                size="lg"
              >
                <CheckCircle2 className="h-4 w-4" />
                {updateStatus.isPending
                  ? t('common.updating', { fallback: 'Updating...' })
                  : t('common.publish', {
                      fallback: 'Publish',
                    })}
              </Button>
            ) : (
              <Button
                onClick={() => setStartQuizDialogOpen(true)}
                className="w-full flex items-center justify-center gap-2"
                size="lg"
              >
                <Play className="h-4 w-4" />
                {t('instructor.quiz.startQuiz', {
                  fallback: 'Start Quiz',
                })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AssignmentDialog
        quiz={quiz}
        open={startQuizDialogOpen}
        onOpenChange={setStartQuizDialogOpen}
      />
    </>
  );
}
