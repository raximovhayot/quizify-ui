'use client';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useParams, usePathname, useRouter } from 'next/navigation';

import { QuizForm } from '@/components/features/instructor/quiz/components/QuizForm';
import { useQuiz } from '@/components/features/instructor/quiz/hooks/useQuiz';
import { useUpdateQuiz } from '@/components/features/instructor/quiz/hooks/useQuizzes';
import { InstructorQuizUpdateRequest } from '@/components/features/instructor/quiz/types/quiz';
import { ROUTES_APP } from '@/components/features/instructor/routes';
import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function Page() {
  const router = useRouter();
  const t = useTranslations();
  const params = useParams<{ quizId: string }>();
  const quizId = Number(params?.quizId ?? NaN);
  const pathname = usePathname();
  const [open, setOpen] = useState(() => Boolean(pathname?.endsWith('/edit')));

  const { data: quiz, isLoading, error } = useQuiz(quizId);
  const updateQuizMutation = useUpdateQuiz();

  useEffect(() => {
    setOpen(Boolean(pathname?.endsWith('/edit')));
  }, [pathname]);

  const handleQuizSubmit = async (data: InstructorQuizUpdateRequest) => {
    if (!quiz) return;

    await updateQuizMutation.mutateAsync({
      ...data,
      id: quiz.id,
    });

    // Close modal after successful update
    router.push(ROUTES_APP.quizzes.detail(quiz.id));
  };

  const handleCancel = () => {
    if (quiz) {
      router.push(ROUTES_APP.quizzes.detail(quiz.id));
    } else {
      router.push(ROUTES_APP.quizzes.list());
    }
  };

  if (isNaN(quizId)) {
    return (
      <Dialog
        open={open}
        onOpenChange={(open) => {
          if (!open) router.push(ROUTES_APP.quizzes.list());
        }}
      >
        <DialogContent>
          <DialogTitle className="sr-only">
            {t('instructor.quiz.edit.dialogTitle', { fallback: 'Edit Quiz' })}
          </DialogTitle>
          <ContentPlaceholder
            title={t('instructor.quiz.edit.error.invalidId', {
              fallback: 'Invalid Quiz ID',
            })}
            description={t('instructor.quiz.edit.error.invalidIdDescription', {
              fallback: 'The quiz ID provided is not valid.',
            })}
            actions={[
              {
                label: t('instructor.quiz.view.backToList', {
                  fallback: 'Back to Quizzes',
                }),
                onClick: () => router.push(ROUTES_APP.quizzes.list()),
                variant: 'default',
              },
            ]}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          if (quiz) {
            router.push(ROUTES_APP.quizzes.detail(quiz.id));
          } else {
            router.push(ROUTES_APP.quizzes.list());
          }
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          {t('instructor.quiz.edit.dialogTitle', { fallback: 'Edit Quiz' })}
        </DialogTitle>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <ContentPlaceholder
            title={t('instructor.quiz.edit.error.loadFailed', {
              fallback: 'Failed to load quiz',
            })}
            description={t('instructor.quiz.edit.error.loadFailedDescription', {
              fallback: 'There was an error loading the quiz data.',
            })}
            actions={[
              {
                label: t('instructor.quiz.view.backToList', {
                  fallback: 'Back to Quizzes',
                }),
                onClick: () => router.push(ROUTES_APP.quizzes.list()),
                variant: 'default',
              },
            ]}
          />
        )}

        {quiz && (
          <QuizForm
            quiz={quiz}
            onSubmit={handleQuizSubmit}
            onCancel={handleCancel}
            isSubmitting={updateQuizMutation.isPending}
            className="border-none shadow-none rounded-none p-0 [&_[data-slot=card-header]]:px-0 [&_[data-slot=card-content]]:px-0 [&_[data-slot=card-footer]]:px-0 bg-background"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
