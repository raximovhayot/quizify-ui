'use client';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useParams, usePathname, useRouter } from 'next/navigation';

import { QuizForm } from '@/features/instructor/quiz/components/QuizForm';
import { useQuiz } from '@/features/instructor/quiz/hooks/useQuiz';
import { useUpdateQuiz } from '@/features/instructor/quiz/hooks/useQuizzes';
import { InstructorQuizUpdateRequest } from '@/features/instructor/quiz/types/quiz';
import { ROUTES_APP } from '@/features/instructor/routes';
import { useResponsive } from '@/components/shared/hooks/useResponsive';
import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';
import {
  FormDrawer,
  FormDrawerContent,
  FormDrawerHeader,
  FormDrawerTitle,
  FormDrawerBody,
} from '@/components/shared/ui/FormDrawer';
import { Dialog, DialogTitle } from '@/components/ui/dialog';
import { ScrollableDialogContent } from '@/components/shared/ui/ScrollableDialogContent';
import { Skeleton } from '@/components/ui/skeleton';

export default function Page() {
  const router = useRouter();
  const t = useTranslations();
  const { isMobile } = useResponsive();
  const params = useParams<{ quizId: string }>();
  const quizId = Number(params?.quizId ?? Number.NaN);
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
    router.back();
  };

  if (Number.isNaN(quizId)) {
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
        <FormDrawer
          open={open}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) router.push(ROUTES_APP.quizzes.list());
          }}
        >
          <FormDrawerContent side="bottom" open={open} className="rounded-t-2xl">
            <FormDrawerHeader className="pb-4">
              <FormDrawerTitle>
                {t('instructor.quiz.edit.dialogTitle', {
                  fallback: 'Edit Quiz',
                })}
              </FormDrawerTitle>
            </FormDrawerHeader>
            <FormDrawerBody className="pb-8">{errorContent}</FormDrawerBody>
          </FormDrawerContent>
        </FormDrawer>
      );
    }

    return (
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) router.push(ROUTES_APP.quizzes.list());
        }}
      >
        <ScrollableDialogContent className="rounded-2xl">
          <DialogTitle className="sr-only">
            {t('instructor.quiz.edit.dialogTitle', { fallback: 'Edit Quiz' })}
          </DialogTitle>
          {errorContent}
        </ScrollableDialogContent>
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
      hideTitle
      className="border-none shadow-none rounded-none p-0 [&_[data-slot=card-header]]:px-0 [&_[data-slot=card-content]]:px-0 [&_[data-slot=card-footer]]:px-0 bg-background"
    />
  ) : null;

  const content = isLoading
    ? loadingSkeleton
    : error
      ? errorContent
      : formContent;

  // Mobile: Use full-screen Form Drawer
  if (isMobile) {
    return (
      <FormDrawer
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            const isOnEdit = pathname?.endsWith('/edit');
            if (isOnEdit) {
              const canGoBack =
                typeof window !== 'undefined' &&
                ((window.history?.state?.idx ?? 0) > 0 || window.history.length > 1);
              if (canGoBack) router.back();
              else router.push(ROUTES_APP.quizzes.list());
            }
          }
        }}
      >
        <FormDrawerContent side="bottom" open={open} className="rounded-t-2xl">
          <FormDrawerHeader className="pb-4">
            <FormDrawerTitle>
              {t('instructor.quiz.edit.dialogTitle', { fallback: 'Edit Quiz' })}
            </FormDrawerTitle>
          </FormDrawerHeader>
          <FormDrawerBody className="pb-8">{content}</FormDrawerBody>
        </FormDrawerContent>
      </FormDrawer>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          const isOnEdit = pathname?.endsWith('/edit');
          if (isOnEdit) {
            const canGoBack =
              typeof window !== 'undefined' &&
              ((window.history?.state?.idx ?? 0) > 0 || window.history.length > 1);
            if (canGoBack) router.back();
            else router.push(ROUTES_APP.quizzes.list());
          }
        }
      }}
    >
      <ScrollableDialogContent className="max-w-2xl rounded-2xl">
        <DialogTitle className="sr-only">
          {t('instructor.quiz.edit.dialogTitle', { fallback: 'Edit Quiz' })}
        </DialogTitle>
        {content}
      </ScrollableDialogContent>
    </Dialog>
  );
}
