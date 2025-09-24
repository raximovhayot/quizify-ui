'use client';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

import { CreateQuizContainer } from '@/components/features/instructor/quiz/components/CreateQuizContainer';
import { ROUTES_APP } from '@/components/features/instructor/routes';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function CreateQuizModalPage() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (pathname?.endsWith('/quizzes/new')) {
      setOpen(true);
    }
  }, [pathname]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) router.push(ROUTES_APP.quizzes.list());
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
