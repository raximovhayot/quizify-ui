'use client';

import { Controller, useFormContext } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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
            <>
              <Switch
                id="trueFalseAnswer"
                checked={!!field.value}
                onCheckedChange={field.onChange}
              />
              <Label htmlFor="trueFalseAnswer">
                {t('common.question.trueFalse.correctIsTrue', {
                  fallback: 'Correct is True',
                })}
              </Label>
            </>
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
