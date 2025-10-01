'use client';

import { useFormContext } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <div className="space-y-2">
        <Label>
          {t('common.question.ranking.items', {
            fallback: 'Ranking items',
          })}
        </Label>
        <div className="space-y-2">
          {items.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                className="flex-1"
                placeholder={t('common.item', { fallback: 'Item' })}
                {...register(`rankingItems.${index}` as const)}
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => moveItem(index, Math.max(0, index - 1))}
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
              >
                {t('common.down', { fallback: 'Down' })}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => removeItem(index)}
              >
                {t('common.remove', { fallback: 'Remove' })}
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addItem}>
            {t('common.add', { fallback: 'Add' })}
          </Button>
          {rankingErrorMsg && (
            <p className="text-sm text-destructive mt-1">{rankingErrorMsg}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <BaseQuestionForm {...props} fixedType={QuestionType.RANKING}>
      <RankingFields />
    </BaseQuestionForm>
  );
}
