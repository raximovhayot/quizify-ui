'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { useResponsive } from '@/components/shared/hooks/useResponsive';
import {
  FormDrawer,
  FormDrawerContent,
  FormDrawerHeader,
  FormDrawerBody,
} from '@/components/shared/ui/FormDrawer';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollableDialogContent } from '@/components/shared/ui/ScrollableDialogContent';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import type { TInstructorQuestionForm } from '../schemas/questionSchema';
import { QuestionDataDto, QuestionType } from '../types/question';
import {
  QuestionFormRenderer,
  getAllQuestionTypes,
  getQuestionTypeLabel,
} from './factories/questionFormRegistry';

export interface QuestionEditorDialogProps {
  quizId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TInstructorQuestionForm) => Promise<void>;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
  question?: QuestionDataDto | null;
}

export function QuestionEditorDialog({
  quizId,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  mode = 'create',
  question,
}: QuestionEditorDialogProps) {
  const t = useTranslations();
  const { isMobile } = useResponsive();
  
  // For create mode, allow type selection; for edit mode, type is fixed
  const [selectedType, setSelectedType] = useState<QuestionType>(
    question?.questionType || QuestionType.MULTIPLE_CHOICE
  );

  const handleSubmit = async (formData: TInstructorQuestionForm) => {
    await onSubmit(formData);
  };

  const isEditMode = mode === 'edit' || !!question;

  const formContent = (
    <div className="space-y-4">
      {/* Question Type Selector - Only show in create mode */}
      {!isEditMode && (
        <div className="pb-2">
          <Field>
            <FieldLabel htmlFor="question-type" className="text-sm font-medium">
              {t('common.question.type.label', {
                fallback: 'Question type',
              })}
            </FieldLabel>
            <FieldContent>
              <Select
                value={selectedType}
                onValueChange={(val) => setSelectedType(val as QuestionType)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="question-type" className="w-full mt-2">
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
            </FieldContent>
          </Field>
        </div>
      )}

      {/* Question Type Badge - Show in edit mode */}
      {isEditMode && question && (
        <div className="flex items-center justify-between pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t('common.question.type.label', { fallback: 'Question type' })}
          </span>
          <Badge variant="secondary" className="font-medium">
            {getQuestionTypeLabel(t, question.questionType)}
          </Badge>
        </div>
      )}

      {/* Question Form */}
      <div>
        <QuestionFormRenderer
          type={isEditMode && question ? question.questionType : selectedType}
          quizId={quizId}
          initialData={isEditMode ? question || undefined : undefined}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );

  // Mobile: Use full-screen Form Drawer
  if (isMobile) {
    return (
      <FormDrawer open={open} onOpenChange={onOpenChange}>
        <FormDrawerContent side="bottom" open={open} className="rounded-t-2xl">
          <FormDrawerHeader className="pb-2">
            {/* Question type selector in header for mobile */}
            {!isEditMode && (
              <Field>
                <FieldLabel htmlFor="question-type-mobile" className="text-sm font-medium">
                  {t('common.question.type.label', {
                    fallback: 'Question type',
                  })}
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={selectedType}
                    onValueChange={(val) => setSelectedType(val as QuestionType)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="question-type-mobile" className="w-full mt-2">
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
                </FieldContent>
              </Field>
            )}
            {isEditMode && question && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('common.question.type.label', { fallback: 'Question type' })}
                </span>
                <Badge variant="secondary" className="font-medium">
                  {getQuestionTypeLabel(t, question.questionType)}
                </Badge>
              </div>
            )}
          </FormDrawerHeader>
          <FormDrawerBody className="pb-8">
            <QuestionFormRenderer
              type={isEditMode && question ? question.questionType : selectedType}
              quizId={quizId}
              initialData={isEditMode ? question || undefined : undefined}
              isSubmitting={isSubmitting}
              onCancel={() => onOpenChange(false)}
              onSubmit={handleSubmit}
            />
          </FormDrawerBody>
        </FormDrawerContent>
      </FormDrawer>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className="w-full sm:max-w-3xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t('common.editQuestion', { fallback: 'Edit Question' })
              : t('common.createQuestion', { fallback: 'Create Question' })}
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </ScrollableDialogContent>
    </Dialog>
  );
}
