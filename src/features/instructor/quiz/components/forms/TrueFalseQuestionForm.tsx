'use client';

import { Controller, useFormContext } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Switch } from '@/components/ui/switch';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';

import type { TInstructorQuestionForm } from '../../schemas/questionSchema';
import { QuestionType } from '../../types/question';
import type { BaseQuestionFormProps } from './BaseQuestionForm';
import { BaseQuestionForm } from './BaseQuestionForm';

export type TrueFalseQuestionFormProps = Omit<
  BaseQuestionFormProps,
  'fixedType' | 'children'
>;

export function TrueFalseQuestionForm(props: TrueFalseQuestionFormProps) {
  const t = useTranslations();

  function TFFields() {
    const { control } = useFormContext<TInstructorQuestionForm>();
    return (
      <div className="flex items-center gap-2">
        <Controller
          name="trueFalseAnswer"
          control={control}
          render={({ field }) => (
            <Field className="flex items-center justify-between rounded-lg border px-3 py-3 min-h-12 w-full">
              <FieldLabel htmlFor="trueFalseAnswer" className="text-sm">
                {t('common.question.trueFalse.correctIsTrue', {
                  fallback: 'Correct is True',
                })}
              </FieldLabel>
              <FieldContent>
                <Switch
                  id="trueFalseAnswer"
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              </FieldContent>
            </Field>
          )}
        />
      </div>
    );
  }

  return (
    <BaseQuestionForm {...props} fixedType={QuestionType.TRUE_FALSE}>
      <TFFields />
    </BaseQuestionForm>
  );
}
