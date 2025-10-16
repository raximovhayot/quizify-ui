'use client';

import { useFormContext } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';

import { QuestionType } from '../../types/question';
import type { BaseQuestionFormProps } from './BaseQuestionForm';
import { BaseQuestionForm } from './BaseQuestionForm';

export type RankingQuestionFormProps = Omit<
  BaseQuestionFormProps,
  'fixedType' | 'children'
>;

export function RankingQuestionForm(props: RankingQuestionFormProps) {
  const t = useTranslations();

  function RankingFields() {
    type TRankingForm = { rankingItems: string[] };
    const { register, watch, setValue, formState } =
      useFormContext<TRankingForm>();
    const items = (watch('rankingItems') ?? []) as string[];
    const moveItem = (from: number, to: number) => {
      if (to < 0 || to >= items.length) return;
      const next = [...items];
      const spliced = next.splice(from, 1)[0] as string;
      next.splice(to, 0, spliced);
      setValue('rankingItems', next);
    };
    const addItem = () => setValue('rankingItems', [...items, '']);
    const removeItem = (index: number) =>
      setValue(
        'rankingItems',
        items.filter((_, i) => i !== index)
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
    const rankingErrorMsg = getMessage(
      (formState.errors as unknown as { rankingItems?: unknown }).rankingItems
    );

    return (
      <Field>
        <FieldLabel>
          {t('common.question.ranking.items', {
            fallback: 'Ranking items',
          })}
        </FieldLabel>
        <FieldContent>
          <div className="space-y-3">
            {items.map((_, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                <Field className="flex-1">
                  <FieldLabel htmlFor={`rankingItems-${index}`} className="text-xs">
                    {t('common.item', { fallback: 'Item' })} {index + 1}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`rankingItems-${index}`}
                      placeholder={t('common.item', { fallback: 'Item' })}
                      aria-invalid={!!rankingErrorMsg}
                      aria-describedby={rankingErrorMsg ? `rankingItems-error` : undefined}
                      {...register(`rankingItems.${index}` as const)}
                    />
                  </FieldContent>
                </Field>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => moveItem(index, Math.max(0, index - 1))}
                    className="flex-1 sm:flex-none"
                  >
                    {t('common.up', { fallback: 'Up' })}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      moveItem(index, Math.min(items.length - 1, index + 1))
                    }
                    className="flex-1 sm:flex-none"
                  >
                    {t('common.down', { fallback: 'Down' })}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeItem(index)}
                    className="flex-1 sm:flex-none"
                  >
                    {t('common.remove', { fallback: 'Remove' })}
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="w-full sm:w-auto"
            >
              {t('common.add', { fallback: 'Add' })}
            </Button>
            <FieldError id="rankingItems-error">{rankingErrorMsg}</FieldError>
          </div>
        </FieldContent>
      </Field>
    );
  }

  return (
    <BaseQuestionForm {...props} fixedType={QuestionType.RANKING}>
      <RankingFields />
    </BaseQuestionForm>
  );
}
