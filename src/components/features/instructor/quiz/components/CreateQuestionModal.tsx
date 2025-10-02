'use client';

import { XIcon } from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { useResponsive } from '@/components/shared/hooks/useResponsive';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useCreateQuestion } from '../hooks/useQuestions';
import type { TInstructorQuestionForm } from '../schemas/questionSchema';
import { toInstructorQuestionSaveRequest } from '../schemas/questionSchema';
import { QuestionType } from '../types/question';
import {
  QuestionFormRenderer,
  getAllQuestionTypes,
  getQuestionTypeLabel,
} from './factories/questionFormRegistry';

export interface CreateQuestionModalProps {
  quizId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateQuestionModal({
  quizId,
  open,
  onOpenChange,
}: CreateQuestionModalProps) {
  const t = useTranslations();
  const { isMobile } = useResponsive();
  const [selectedType, setSelectedType] = useState<QuestionType>(
    QuestionType.MULTIPLE_CHOICE
  );
  const createQuestion = useCreateQuestion();

  const handleCreate = async (formData: TInstructorQuestionForm) => {
    try {
      const payload = toInstructorQuestionSaveRequest(formData);
      await createQuestion.mutateAsync(payload);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    }
  };

  const formContent = (
    <div className="space-y-4">
      <div>
        <Label htmlFor="create-question-type">
          {t('common.question.type.label', {
            fallback: 'Question type',
          })}
        </Label>
        <Select
          value={selectedType}
          onValueChange={(val) => setSelectedType(val as QuestionType)}
          disabled={createQuestion.isPending}
        >
          <SelectTrigger id="create-question-type">
            <SelectValue
              placeholder={t('common.question.type.placeholder', {
                fallback: 'Select type',
              })}
            />
          </SelectTrigger>
          <SelectContent>
            {getAllQuestionTypes().map((type) => (
              <SelectItem key={type} value={type}>
                {getQuestionTypeLabel(t, type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <QuestionFormRenderer
        type={selectedType}
        quizId={quizId}
        isSubmitting={createQuestion.isPending}
        onCancel={() => onOpenChange(false)}
        onSubmit={handleCreate}
      />
    </div>
  );

  // Mobile: Use Sheet (bottom drawer)
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          resizable
          snapPoints={['60vh', '80vh', '95vh']}
          className="overflow-y-auto px-4 pb-safe rounded-t-2xl"
        >
          <SheetHeader className="pb-4">
            <SheetTitle>
              {t('common.createQuestion', {
                fallback: 'Create Question',
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            {t('common.createQuestion', {
              fallback: 'Create Question',
            })}
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
