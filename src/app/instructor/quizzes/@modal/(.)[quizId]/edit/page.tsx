'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function EditQuizInterceptedModalPage() {
  const router = useRouter();
  const t = useTranslations();
  const params = useParams<{ quizId: string }>();
  const quizId = Number(params.quizId);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.push('/instructor/quizzes');
      }}
    >
      <DialogContent
        className="
          p-0 md:p-6
          w-[95vw] md:w-[80vw] max-w-4xl max-h-[85vh]
          overflow-y-auto md:rounded-lg
        "
      >
        <div className="p-4 md:p-0 md:container md:mx-auto">
          <DialogTitle className="sr-only">
            {t('instructor.quiz.edit.dialogTitle', { fallback: 'Edit Quiz' })}
          </DialogTitle>
          <div className="">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
