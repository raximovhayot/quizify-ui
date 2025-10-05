'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { RichTextField } from '@/components/shared/form/RichTextField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import {
  TInstructorQuestionForm,
  instructorQuestionFormSchema,
} from '../../schemas/questionSchema';
import { QuestionDataDto, QuestionType } from '../../types/question';
import {
  buildCreateDefaultsFor,
  buildEditDefaultsFor,
} from '../factories/questionDefaultsRegistry';

export interface BaseQuestionFormProps {
  quizId: number;
  fixedType: QuestionType;
  onSubmit: (data: TInstructorQuestionForm) => Promise<void>;
  onSubmitAndContinue?: (data: TInstructorQuestionForm) => Promise<void>; // optional secondary action for bulk creation
  onCancel?: () => void;
  isSubmitting?: boolean;
  initialData?: QuestionDataDto;
  children?: React.ReactNode; // type-specific fields rendered inside form
}

/**
 * BaseQuestionForm
 *
 * What it is:
 * - A shared form wrapper used by every specific question type form
 *   (MultipleChoice, TrueFalse, ShortAnswer, FillInBlank, Essay, Matching, Ranking).
 * - It centralizes the common form setup (react-hook-form + Zod resolver),
 *   shared fields (points, content, explanation, submit/cancel), and submission flow.
 * - It enforces a fixed question type (fixedType) for the given form, so each
 *   type-specific form doesn’t need to render or manage a type selector.
 *
 * Why we need it:
 * - Removes duplication: previously each question-type form duplicated the same
 *   form provider, schema resolver, common inputs, and buttons.
 * - Ensures consistency: validation and UI for shared fields behave identically
 *   across all question types.
 * - Safer composition: children render only type-specific fields while the base
 *   guarantees the surrounding provider/context is valid (prevents useFormContext
 *   usage errors outside of a FormProvider).
 * - Plays well with the Strategy/Abstract Factory registry (QuestionFormRenderer):
 *   the registry picks the concrete type component; each of those composes this base.
 */
export function BaseQuestionForm({
  quizId,
  fixedType,
  onSubmit,
  onSubmitAndContinue: _onSubmitAndContinue,
  onCancel,
  isSubmitting,
  initialData,
  children,
}: Readonly<BaseQuestionFormProps>) {
  const t = useTranslations();

  // Defaults are provided by the Question Defaults Strategy/Factory
  // (see ../factories/questionDefaultsRegistry) to keep this base form lean
  // and aligned with our design-pattern approach.

  const form = useForm<TInstructorQuestionForm>({
    resolver: zodResolver(instructorQuestionFormSchema),
    defaultValues: initialData
      ? buildEditDefaultsFor(fixedType, quizId, initialData)
      : buildCreateDefaultsFor(fixedType, quizId),
  });

  const submit = async (data: TInstructorQuestionForm) => {
    await onSubmit(data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
        {/* Type is fixed; no selector here */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label htmlFor="points">
              {t('common.question.points', { fallback: 'Points' })}
            </Label>
            <Input
              id="points"
              type="number"
              min={0}
              {...form.register('points', { valueAsNumber: true })}
            />
            {form.formState.errors.points?.message && (
              <p className="text-sm text-destructive mt-1">
                {String(form.formState.errors.points?.message)}
              </p>
            )}
          </div>
        </div>

        <div>
          <RichTextField
            control={form.control}
            name="content"
            label={t('common.question.content.label', { fallback: 'Question' })}
            placeholder={t('common.question.content.placeholder', {
              fallback: 'Enter your question here. You can use formatting...',
            })}
            minHeight="150px"
            required
          />
        </div>

        <div>
          <Label htmlFor="explanation">
            {t('common.question.explanation.label', {
              fallback: 'Explanation (optional)',
            })}
          </Label>
          <Textarea
            id="explanation"
            rows={3}
            placeholder={t('common.question.explanation.placeholder', {
              fallback:
                'Add an explanation or feedback shown after answering (optional)',
            })}
            {...form.register('explanation')}
          />
          {form.formState.errors.explanation?.message && (
            <p className="text-sm text-destructive mt-1">
              {String(form.formState.errors.explanation?.message)}
            </p>
          )}
        </div>

        {/* Type-specific fields */}
        {children}

        <Separator />

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {t('common.cancel', { fallback: 'Cancel' })}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting
              ? t('common.saving', { fallback: 'Saving...' })
              : initialData
                ? t('common.save', { fallback: 'Save' })
                : t('common.create', { fallback: 'Create' })}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
