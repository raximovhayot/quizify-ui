'use client';

import { useTranslations } from 'next-intl';

import { QuizDataDTO } from '@/components/features/instructor/quiz/types';
import { useResponsive } from '@/components/shared/hooks/useResponsive';
import {
  ResizableSheet,
  ResizableSheetContent,
  ResizableSheetHeader,
  ResizableSheetTitle,
} from '@/components/shared/ui/ResizableSheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { AssignmentForm } from './AssignmentForm';

export interface StartQuizDialogProps {
  quiz: QuizDataDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignmentDialog({
  quiz,
  open,
  onOpenChange,
}: Readonly<StartQuizDialogProps>) {
  const t = useTranslations();
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <ResizableSheet open={open} onOpenChange={onOpenChange}>
        <ResizableSheetContent
          side="bottom"
          resizable
          snapPoints={['40vh', '65vh', '85vh']}
          className="overflow-y-auto px-4 pb-safe rounded-t-2xl"
        >
          <ResizableSheetHeader className="pb-4" hasResizeHandle>
            <ResizableSheetTitle>
              {t('instructor.assignment.create.title', {
                fallback: 'Start Quiz',
              })}
            </ResizableSheetTitle>
          </ResizableSheetHeader>

          <AssignmentForm quiz={quiz} onSuccess={() => onOpenChange(false)} />
        </ResizableSheetContent>
      </ResizableSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {t('instructor.assignment.create.title', {
              fallback: 'Start Quiz',
            })}
          </DialogTitle>
          <DialogDescription>
            {t('instructor.assignment.create.description', {
              fallback:
                'Create an assignment to start the quiz for your students.',
            })}
          </DialogDescription>
        </DialogHeader>

        <AssignmentForm quiz={quiz} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
