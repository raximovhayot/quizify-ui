'use client';

import { useFormContext } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Label } from '@/components/ui/label';
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
      <div>
        <Label htmlFor="blankTemplate">
          {t('common.question.fillInBlank.template', {
            fallback: 'Template',
          })}
        </Label>
        <Textarea id="blankTemplate" rows={3} {...register('blankTemplate')} />
        {templateErrorMsg && (
          <p className="text-sm text-destructive mt-1">{templateErrorMsg}</p>
        )}
      </div>
    );
  }

  return (
    <BaseQuestionForm {...props} fixedType={QuestionType.FILL_IN_BLANK}>
      <FIBFields />
    </BaseQuestionForm>
  );
}
