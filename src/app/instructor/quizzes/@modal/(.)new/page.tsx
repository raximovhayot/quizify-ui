'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { CreateQuizContainer } from '@/components/features/instructor/quiz/components/CreateQuizContainer';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function CreateQuizModalPage() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.push('/instructor/quizzes');
      }}
    >
      <DialogContent>
        <DialogTitle className="sr-only">
          {t('instructor.quiz.create.dialogTitle', {
            fallback: 'Create Quiz',
          })}
        </DialogTitle>
        <CreateQuizContainer className="border-none shadow-none rounded-none p-0 [&_[data-slot=card-header]]:px-0 [&_[data-slot=card-content]]:px-0 [&_[data-slot=card-footer]]:px-0" />
      </DialogContent>
    </Dialog>
  );
}
