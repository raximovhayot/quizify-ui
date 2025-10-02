'use client';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useParams, usePathname, useRouter } from 'next/navigation';

import { QuizForm } from '@/components/features/instructor/quiz/components/QuizForm';
import { useQuiz } from '@/components/features/instructor/quiz/hooks/useQuiz';
import { useUpdateQuiz } from '@/components/features/instructor/quiz/hooks/useQuizzes';
import { InstructorQuizUpdateRequest } from '@/components/features/instructor/quiz/types/quiz';
import { ROUTES_APP } from '@/components/features/instructor/routes';
import { useResponsive } from '@/components/shared/hooks/useResponsive';
import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

export default function Page() {
  const router = useRouter();
  const t = useTranslations();
  const { isMobile } = useResponsive();
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
    const errorContent = (
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
    );

    if (isMobile) {
      return (
        <Sheet
          open={open}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) router.push(ROUTES_APP.quizzes.list());
          }}
        >
          <SheetContent
            side="bottom"
            resizable
            snapPoints={['60vh', '80vh', '95vh']}
            className="overflow-y-auto px-4 pb-safe rounded-t-2xl"
          >
            <SheetHeader className="pb-4" hasResizeHandle>
              <SheetTitle>
                {t('instructor.quiz.edit.dialogTitle', {
                  fallback: 'Edit Quiz',
                })}
              </SheetTitle>
            </SheetHeader>
            <div className="pb-8">{errorContent}</div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) router.push(ROUTES_APP.quizzes.list());
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogTitle className="sr-only">
            {t('instructor.quiz.edit.dialogTitle', { fallback: 'Edit Quiz' })}
          </DialogTitle>
          {errorContent}
        </DialogContent>
      </Dialog>
    );
  }

  const loadingSkeleton = (
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
  );

  const errorContent = error ? (
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
  ) : null;

  const formContent = quiz ? (
    <QuizForm
      quiz={quiz}
      onSubmit={handleQuizSubmit}
      onCancel={handleCancel}
      isSubmitting={updateQuizMutation.isPending}
      className="border-none shadow-none rounded-none p-0 [&_[data-slot=card-header]]:px-0 [&_[data-slot=card-content]]:px-0 [&_[data-slot=card-footer]]:px-0 bg-background"
    />
  ) : null;

  const content = isLoading
    ? loadingSkeleton
    : error
      ? errorContent
      : formContent;

  // Mobile: Use Sheet (bottom drawer)
  if (isMobile) {
    return (
      <Sheet
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            if (quiz) {
              router.push(ROUTES_APP.quizzes.detail(quiz.id));
            } else {
              router.push(ROUTES_APP.quizzes.list());
            }
          }
        }}
      >
        <SheetContent
          side="bottom"
          resizable
          snapPoints={['60vh', '80vh', '95vh']}
          className="overflow-y-auto px-4 pb-safe rounded-t-2xl"
        >
          <SheetHeader className="pb-4" hasResizeHandle>
            <SheetTitle>
              {t('instructor.quiz.edit.dialogTitle', { fallback: 'Edit Quiz' })}
            </SheetTitle>
          </SheetHeader>
          <div className="pb-8">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          if (quiz) {
            router.push(ROUTES_APP.quizzes.detail(quiz.id));
          } else {
            router.push(ROUTES_APP.quizzes.list());
          }
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogTitle className="sr-only">
          {t('instructor.quiz.edit.dialogTitle', { fallback: 'Edit Quiz' })}
        </DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  );
}
