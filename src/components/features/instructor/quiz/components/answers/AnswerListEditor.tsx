'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { TInstructorQuestionForm } from '../../schemas/questionSchema';

interface AnswerListEditorProps {
  name?: 'answers'; // we currently support only answers array
  enforceCorrect?: boolean; // for Short Answer, all are correct
  disabled?: boolean;
}

export function AnswerListEditor({
  name = 'answers',
  enforceCorrect = false,
  disabled,
}: AnswerListEditorProps) {
  const t = useTranslations();
  const { control, register, watch } =
    useFormContext<TInstructorQuestionForm>();

  const { fields, append, remove, move } = useFieldArray<
    TInstructorQuestionForm,
    'answers'
  >({ control, name });

  const answers = watch(name) as
    | { content: string; correct?: boolean }[]
    | undefined;

  const handleAdd = () => {
    append({
      content: '',
      correct: enforceCorrect ? true : false,
      order: fields.length,
    });
  };

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col gap-2 border rounded-md p-3"
        >
          <div className="flex items-center gap-2">
            <Label htmlFor={`${name}.${index}.content`} className="text-sm">
              {t('instructor.quiz.question.answer', { fallback: 'Answer' })}{' '}
              {index + 1}
            </Label>
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => move(index, Math.max(0, index - 1))}
                disabled={disabled || index === 0}
              >
                {t('common.up', { fallback: 'Up' })}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  move(index, Math.min(fields.length - 1, index + 1))
                }
                disabled={disabled || index === fields.length - 1}
              >
                {t('common.down', { fallback: 'Down' })}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => remove(index)}
                disabled={disabled}
              >
                {t('common.remove', { fallback: 'Remove' })}
              </Button>
            </div>
          </div>
          <Input
            id={`${name}.${index}.content`}
            {...register(`${name}.${index}.content` as const)}
            placeholder={t('instructor.quiz.question.answer.placeholder', {
              fallback: 'Enter answer text',
            })}
            disabled={disabled}
          />
          {!enforceCorrect && (
            <div className="flex items-center gap-2">
              <Switch
                id={`${name}.${index}.correct`}
                checked={!!answers?.[index]?.correct}
                onCheckedChange={(checked) => {
                  // RHF lacks direct setter here; use register's onChange
                  const input = document.querySelector<HTMLInputElement>(
                    `input[name='${name}.${index}.correct']`
                  );
                  if (input) {
                    input.checked = !!checked;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                }}
                disabled={disabled}
              />
              <Label htmlFor={`${name}.${index}.correct`} className="text-sm">
                {t('instructor.quiz.question.correct', { fallback: 'Correct' })}
              </Label>
            </div>
          )}
          {/* Hidden order field to sync order by index */}
          <input
            type="hidden"
            {...register(`${name}.${index}.order` as const, { value: index })}
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAdd}
        disabled={disabled}
      >
        {t('common.add', { fallback: 'Add' })}
      </Button>
    </div>
  );
}
