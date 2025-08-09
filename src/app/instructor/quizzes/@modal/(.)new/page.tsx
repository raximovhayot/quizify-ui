'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { NewQuizContainer } from '@/components/features/instructor/quiz/components/NewQuizContainer';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function NewQuizInterceptedModalPage() {
  const router = useRouter();
  const t = useTranslations();

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
            {t('instructor.quiz.create.dialogTitle', {
              fallback: 'Create Quiz',
            })}
          </DialogTitle>
          <NewQuizContainer />
        </div>
      </DialogContent>
    </Dialog>
  );
}
