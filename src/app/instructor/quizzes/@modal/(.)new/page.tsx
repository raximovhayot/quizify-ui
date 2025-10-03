'use client';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

import { CreateQuizContainer } from '@/components/features/instructor/quiz/components/CreateQuizContainer';
import { ROUTES_APP } from '@/components/features/instructor/routes';
import { useResponsive } from '@/components/shared/hooks/useResponsive';
import {
  ResizableSheet,
  ResizableSheetContent,
  ResizableSheetHeader,
  ResizableSheetTitle,
} from '@/components/shared/ui/ResizableSheet';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function CreateQuizModalPage() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const { isMobile } = useResponsive();
  const [open, setOpen] = useState(() =>
    Boolean(pathname?.endsWith('/quizzes/new'))
  );

  useEffect(() => {
    setOpen(Boolean(pathname?.endsWith('/quizzes/new')));
  }, [pathname]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) router.push(ROUTES_APP.quizzes.list());
  };

  const content = (
    <CreateQuizContainer
      hideTitle
      className="border-none shadow-none rounded-none p-0 [&_[data-slot=card-header]]:px-0 [&_[data-slot=card-content]]:px-0 [&_[data-slot=card-footer]]:px-0 bg-background"
    />
  );

  // Mobile: Use Sheet (bottom drawer)
  if (isMobile) {
    return (
      <ResizableSheet open={open} onOpenChange={handleOpenChange}>
        <ResizableSheetContent
          side="bottom"
          resizable
          snapPoints={['40vh', '65vh', '85vh']}
          className="overflow-y-auto px-4 pb-safe rounded-t-2xl"
        >
          <ResizableSheetHeader className="pb-4" hasResizeHandle>
            <ResizableSheetTitle>
              {t('instructor.quiz.create.dialogTitle', {
                fallback: 'Create Quiz',
              })}
            </ResizableSheetTitle>
          </ResizableSheetHeader>
          <div className="pb-8">{content}</div>
        </ResizableSheetContent>
      </ResizableSheet>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogTitle className="sr-only">
          {t('instructor.quiz.create.dialogTitle', {
            fallback: 'Create Quiz',
          })}
        </DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  );
}
