'use client';

import { XIcon } from 'lucide-react';

import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
      >
        <DialogClose
          type="button"
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
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
        {question && (
          <QuestionFormRenderer
            type={question.questionType}
            quizId={quizId}
            initialData={question}
            isSubmitting={isSubmitting}
            onCancel={onClose}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
