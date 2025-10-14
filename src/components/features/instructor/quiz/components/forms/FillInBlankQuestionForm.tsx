'use client';

import { useFormContext } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

import type { TInstructorQuestionForm } from '../../schemas/questionSchema';
import { QuestionType } from '../../types/question';
import type { BaseQuestionFormProps } from './BaseQuestionForm';
import { BaseQuestionForm } from './BaseQuestionForm';

export type FillInBlankQuestionFormProps = Omit<
  BaseQuestionFormProps,
  'fixedType' | 'children'
>;

export function FillInBlankQuestionForm(
  props: Readonly<FillInBlankQuestionFormProps>
) {
  const t = useTranslations();

  function FIBFields() {
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
    const templateErrorMsg = getMessage(
      (formState.errors as unknown as { blankTemplate?: unknown }).blankTemplate
    );
    return (
      <Field>
        <FieldLabel htmlFor="blankTemplate">
          {t('common.question.fillInBlank.template', {
            fallback: 'Template',
          })}
        </FieldLabel>
        <FieldContent>
          <Textarea
            id="blankTemplate"
            rows={3}
            aria-invalid={!!templateErrorMsg}
            aria-describedby={templateErrorMsg ? 'blankTemplate-error' : undefined}
            {...register('blankTemplate')}
          />
          <FieldError id="blankTemplate-error">{templateErrorMsg}</FieldError>
        </FieldContent>
      </Field>
    );
  }

  return (
    <BaseQuestionForm {...props} fixedType={QuestionType.FILL_IN_BLANK}>
      <FIBFields />
    </BaseQuestionForm>
  );
}
