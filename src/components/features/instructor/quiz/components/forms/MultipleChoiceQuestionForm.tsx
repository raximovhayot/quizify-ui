'use client';

import { useFormContext } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';

import type { TInstructorQuestionForm } from '../../schemas/questionSchema';
import { QuestionType } from '../../types/question';
import { AnswerListEditor } from '../answers/AnswerListEditor';
import type { BaseQuestionFormProps } from './BaseQuestionForm';
import { BaseQuestionForm } from './BaseQuestionForm';

export type MultipleChoiceQuestionFormProps = Omit<
  BaseQuestionFormProps,
  'fixedType' | 'children'
>;

export function MultipleChoiceQuestionForm(
  props: MultipleChoiceQuestionFormProps
) {
  const t = useTranslations();

  function MCFields() {
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
          <AnswerListEditor disabled={props.isSubmitting} />
          <FieldError>{answersErrorMsg}</FieldError>
        </FieldContent>
      </Field>
    );
  }

  return (
    <BaseQuestionForm {...props} fixedType={QuestionType.MULTIPLE_CHOICE}>
      <MCFields />
    </BaseQuestionForm>
  );
}
