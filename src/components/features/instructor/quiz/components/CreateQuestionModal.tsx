'use client';

import { useState } from 'react';

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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    } catch {}
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
      <ResizableSheet open={open} onOpenChange={onOpenChange}>
        <ResizableSheetContent
          side="bottom"
          resizable
          snapPoints={['40vh', '65vh', '85vh']}
          className="overflow-y-auto px-4 pb-safe rounded-t-2xl"
        >
          <ResizableSheetHeader className="pb-4" hasResizeHandle>
            <ResizableSheetTitle>
              {t('common.createQuestion', {
                fallback: 'Create Question',
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent
        className="w-full sm:max-w-2xl rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle>
            {t('common.createQuestion', {
              fallback: 'Create Question',
            })}
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </ScrollableDialogContent>
    </Dialog>
  );
}
