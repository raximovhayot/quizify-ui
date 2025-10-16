'use client';

import { useFormContext } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';

import type { TInstructorQuestionForm } from '../../schemas/questionSchema';
import { QuestionType } from '../../types/question';
import { AnswerListEditor } from '../answers/AnswerListEditor';
import type { BaseQuestionFormProps } from './BaseQuestionForm';
import { BaseQuestionForm } from './BaseQuestionForm';

export type ShortAnswerQuestionFormProps = Omit<
  BaseQuestionFormProps,
  'fixedType' | 'children'
>;

export function ShortAnswerQuestionForm(props: ShortAnswerQuestionFormProps) {
  const t = useTranslations();

  function SAFields() {
    const { formState } = useFormContext<TInstructorQuestionForm>();
    const getMessage = (err: unknown): string | undefined => {
      if (!err) return undefined;
      if (typeof err === 'string') return err;
      if (typeof err === 'object') {
        const obj = err as { message?: unknown; root?: { message?: unknown } };
        if (typeof obj.message === 'string') return obj.message;
        if (obj.root && typeof obj.root.message === 'string')
          return obj.root.message;
      }
      return undefined;
    };
    const answersErrorMsg = getMessage(
      (formState.errors as unknown as { answers?: unknown }).answers
    );
    return (
      <Field>
        <FieldLabel>{t('common.answers', { fallback: 'Answers' })}</FieldLabel>
        <FieldContent>
          <AnswerListEditor enforceCorrect disabled={props.isSubmitting} />
          <FieldError id="answers-error">{answersErrorMsg}</FieldError>
        </FieldContent>
      </Field>
    );
  }

  return (
    <BaseQuestionForm {...props} fixedType={QuestionType.SHORT_ANSWER}>
      <SAFields />
    </BaseQuestionForm>
  );
}
