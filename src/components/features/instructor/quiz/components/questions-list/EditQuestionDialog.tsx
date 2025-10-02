'use client';

import { XIcon } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { useResponsive } from '@/components/shared/hooks/useResponsive';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

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
      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <SheetContent
          side="bottom"
          resizable
          snapPoints={['60vh', '80vh', '95vh']}
          className="overflow-y-auto px-4 pb-safe rounded-t-2xl"
        >
          <SheetHeader className="pb-4" hasResizeHandle>
            <SheetTitle>
              {t('common.editQuestion', {
                fallback: 'Edit Question',
              })}
            </SheetTitle>
          </SheetHeader>
          <div className="pb-8">{formContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        showCloseButton={false}
      >
        <DialogClose
          type="button"
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <XIcon />
          <span className="sr-only">
            {t('common.close', { fallback: 'Close' })}
          </span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>
            {t('common.editQuestion', {
              fallback: 'Edit Question',
            })}
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
