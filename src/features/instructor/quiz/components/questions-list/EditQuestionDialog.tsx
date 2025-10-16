'use client';

import { useTranslations } from 'next-intl';

import { useResponsive } from '@/components/shared/hooks/useResponsive';
import {
  ResizableSheet,
  ResizableSheetContent,
  ResizableSheetHeader,
  ResizableSheetTitle,
} from '@/components/shared/ui/ResizableSheet';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollableDialogContent } from '@/components/shared/ui/ScrollableDialogContent';

import type { TInstructorQuestionForm } from '../../schemas/questionSchema';
import { QuestionDataDto } from '../../types/question';
import { QuestionFormRenderer } from '../factories/questionFormRegistry';

export interface EditQuestionDialogProps {
  open: boolean;
  question: QuestionDataDto | null;
  quizId: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: TInstructorQuestionForm) => Promise<void>;
}

export function EditQuestionDialog({
  open,
  question,
  quizId,
  isSubmitting,
  onClose,
  onSubmit,
}: Readonly<EditQuestionDialogProps>) {
  const t = useTranslations();
  const { isMobile } = useResponsive();

  const formContent = question ? (
    <QuestionFormRenderer
      type={question.questionType}
      quizId={quizId}
      initialData={question}
      isSubmitting={isSubmitting}
      onCancel={onClose}
      onSubmit={onSubmit}
    />
  ) : null;

  // Mobile: Use Sheet (bottom drawer)
  if (isMobile) {
    return (
      <ResizableSheet open={open} onOpenChange={(next) => !next && onClose()}>
        <ResizableSheetContent
          side="bottom"
          resizable
          snapPoints={['40vh', '65vh', '85vh']}
          className="overflow-y-auto px-4 pb-safe rounded-t-2xl"
        >
          <ResizableSheetHeader className="pb-4" hasResizeHandle>
            <ResizableSheetTitle>
              {t('common.editQuestion', {
                fallback: 'Edit Question',
              })}
            </ResizableSheetTitle>
          </ResizableSheetHeader>
          <div className="pb-8">{formContent}</div>
        </ResizableSheetContent>
      </ResizableSheet>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <ScrollableDialogContent
        className="w-full sm:max-w-2xl rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle>
            {t('common.editQuestion', {
              fallback: 'Edit Question',
            })}
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </ScrollableDialogContent>
    </Dialog>
  );
}
