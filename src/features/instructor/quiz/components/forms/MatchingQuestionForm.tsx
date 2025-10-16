'use client';

import { useFormContext } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';

import { QuestionType } from '../../types/question';
import type { BaseQuestionFormProps } from './BaseQuestionForm';
import { BaseQuestionForm } from './BaseQuestionForm';

export type MatchingQuestionFormProps = Omit<
  BaseQuestionFormProps,
  'fixedType' | 'children'
>;

export function MatchingQuestionForm(props: MatchingQuestionFormProps) {
  const t = useTranslations();

  function MatchingFields() {
    type TMatchingForm = {
      matchingPairs: { left: string; right: string }[];
    };
    const { register, watch, setValue, formState } =
      useFormContext<TMatchingForm>();
    const pairs = (watch('matchingPairs') ?? []) as {
      left: string;
      right: string;
    }[];
    const handleAdd = () =>
      setValue('matchingPairs', [...pairs, { left: '', right: '' }]);
    const handleRemove = (index: number) =>
      setValue(
        'matchingPairs',
        pairs.filter((_, i) => i !== index)
      );

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
    const matchingErrorMsg = getMessage(
      (formState.errors as unknown as { matchingPairs?: unknown }).matchingPairs
    );

    return (
      <Field>
        <FieldLabel>
          {t('common.question.matching.pairs', {
            fallback: 'Matching pairs',
          })}
        </FieldLabel>
        <FieldContent>
          <div className="space-y-3">
            {pairs.map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end"
              >
                <div className="sm:col-span-2">
                  <Field>
                    <FieldLabel htmlFor={`matchingPairs-${index}-left`} className="text-xs">
                      {t('common.left', { fallback: 'Left' })}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id={`matchingPairs-${index}-left`}
                        placeholder={t('common.left', { fallback: 'Left' })}
                        aria-invalid={!!matchingErrorMsg}
                        aria-describedby={matchingErrorMsg ? `matchingPairs-error` : undefined}
                        {...register(`matchingPairs.${index}.left` as const)}
                      />
                    </FieldContent>
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field>
                    <FieldLabel htmlFor={`matchingPairs-${index}-right`} className="text-xs">
                      {t('common.right', { fallback: 'Right' })}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id={`matchingPairs-${index}-right`}
                        placeholder={t('common.right', { fallback: 'Right' })}
                        aria-invalid={!!matchingErrorMsg}
                        aria-describedby={matchingErrorMsg ? `matchingPairs-error` : undefined}
                        {...register(`matchingPairs.${index}.right` as const)}
                      />
                    </FieldContent>
                  </Field>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="w-full sm:w-auto"
                >
                  {t('common.remove', { fallback: 'Remove' })}
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              className="w-full sm:w-auto"
            >
              {t('common.add', { fallback: 'Add' })}
            </Button>
            <FieldError id="matchingPairs-error">{matchingErrorMsg}</FieldError>
          </div>
        </FieldContent>
      </Field>
    );
  }

  return (
    <BaseQuestionForm {...props} fixedType={QuestionType.MATCHING}>
      <MatchingFields />
    </BaseQuestionForm>
  );
}
