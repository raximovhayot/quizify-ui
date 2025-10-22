'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { MinimalRichTextFieldLazy as RichTextField } from '@/components/shared/form/lazy';
import { Button } from '@/components/ui/button';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
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
            <Field>
              <FieldLabel htmlFor="points">
                {t('common.question.points', { fallback: 'Points' })}
              </FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    id="points"
                    type="number"
                    min={0}
                    aria-invalid={!!form.formState.errors.points}
                    aria-describedby={form.formState.errors.points ? 'points-error' : undefined}
                    {...form.register('points', { valueAsNumber: true })}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText aria-hidden="true">pts</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError id="points-error" errors={[form.formState.errors.points]} />
              </FieldContent>
            </Field>
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
          <Field>
            <FieldLabel htmlFor="explanation">
              {t('common.question.explanation.label', {
                fallback: 'Explanation (optional)',
              })}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="explanation"
                rows={3}
                placeholder={t('common.question.explanation.placeholder', {
                  fallback:
                    'Add an explanation or feedback shown after answering (optional)',
                })}
                aria-invalid={!!form.formState.errors.explanation}
                aria-describedby={form.formState.errors.explanation ? 'explanation-error' : undefined}
                {...form.register('explanation')}
              />
              <FieldError id="explanation-error" errors={[form.formState.errors.explanation]} />
            </FieldContent>
          </Field>
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
