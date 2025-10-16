'use client';

import { useFormContext } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

import type { TInstructorQuestionForm } from '../../schemas/questionSchema';
import { QuestionType } from '../../types/question';
import type { BaseQuestionFormProps } from './BaseQuestionForm';
import { BaseQuestionForm } from './BaseQuestionForm';

export type EssayQuestionFormProps = Omit<
  BaseQuestionFormProps,
  'fixedType' | 'children'
>;

export function EssayQuestionForm(props: EssayQuestionFormProps) {
  const t = useTranslations();

  function EssayFields() {
    const { formState, register } = useFormContext<TInstructorQuestionForm>();
    const getMessage = (err: unknown): string | undefined => {
      if (!err) return undefined;
      if (typeof err === 'string') return err;
      if (typeof err === 'object') {
        const obj = err as { message?: unknown };
        if (typeof obj.message === 'string') return obj.message;
      }
      return undefined;
    };
    const criteriaErrorMsg = getMessage(
      (formState.errors as unknown as { gradingCriteria?: unknown })
        .gradingCriteria
    );
    return (
      <Field>
        <FieldLabel htmlFor="gradingCriteria">
          {t('common.question.essay.criteria', {
            fallback: 'Grading criteria',
          })}
        </FieldLabel>
        <FieldContent>
          <Textarea
            id="gradingCriteria"
            rows={3}
            aria-invalid={!!criteriaErrorMsg}
            aria-describedby={criteriaErrorMsg ? 'gradingCriteria-error' : undefined}
            {...register('gradingCriteria')}
          />
          <FieldError id="gradingCriteria-error">{criteriaErrorMsg}</FieldError>
        </FieldContent>
      </Field>
    );
  }

  return (
    <BaseQuestionForm {...props} fixedType={QuestionType.ESSAY}>
      <EssayFields />
    </BaseQuestionForm>
  );
}
