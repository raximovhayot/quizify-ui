'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function QuizEditModalPage() {
  const router = useRouter();
  const t = useTranslations();
  const params = useParams<{ quizId: string }>();
  const quizId = Number(params?.quizId ?? NaN);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.push(ROUTES_APP.quizzes.list());
      }}
    >
      <DialogContent>
        <DialogTitle className="sr-only">
          {t('instructor.quiz.edit.dialogTitle', { fallback: 'Edit Quiz' })}
        </DialogTitle>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t('instructor.quiz.edit.title')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('instructor.quiz.edit.stub', {
            fallback:
              'This is a stub page for editing quiz #{id}. The full editor UI will be implemented next.',
            id: quizId,
          })}
        </p>
      </DialogContent>
    </Dialog>
  );
}
