'use client';

import { useFormContext } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Label } from '@/components/ui/label';
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
      <div>
        <Label htmlFor="gradingCriteria">
          {t('instructor.quiz.question.essay.criteria', {
            fallback: 'Grading criteria',
          })}
        </Label>
        <Textarea
          id="gradingCriteria"
          rows={3}
          {...register('gradingCriteria')}
        />
        {criteriaErrorMsg && (
          <p className="text-sm text-destructive mt-1">{criteriaErrorMsg}</p>
        )}
      </div>
    );
  }

  return (
    <BaseQuestionForm {...props} fixedType={QuestionType.ESSAY}>
      <EssayFields />
    </BaseQuestionForm>
  );
}
