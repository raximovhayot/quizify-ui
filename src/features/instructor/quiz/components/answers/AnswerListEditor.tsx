'use client';

import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { RichTextFieldLazy as RichTextField } from '@/components/shared/form/lazy';
import { Button } from '@/components/ui/button';
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
  const { control } = useFormContext<TInstructorQuestionForm>();

  const { fields, append, remove, move } = useFieldArray<
    TInstructorQuestionForm,
    'answers'
  >({ control, name });

  const handleAdd = () => {
    append({
      content: '',
      correct: !!enforceCorrect,
    });
  };

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col gap-3 border rounded-lg p-4 bg-card"
        >
          <div className="flex items-center gap-2">
            <Label
              htmlFor={`${name}.${index}.content`}
              className="text-sm font-medium"
            >
              {t('common.question.answer.label', {
                fallback: 'Answer',
              })}{' '}
              {index + 1}
            </Label>
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => move(index, Math.max(0, index - 1))}
                disabled={disabled || index === 0}
                className="h-8"
              >
                {t('common.up', { fallback: 'Up' })}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  move(index, Math.min(fields.length - 1, index + 1))
                }
                disabled={disabled || index === fields.length - 1}
                className="h-8"
              >
                {t('common.down', { fallback: 'Down' })}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => remove(index)}
                disabled={disabled}
                className="h-8 text-destructive hover:text-destructive"
              >
                {t('common.remove', { fallback: 'Remove' })}
              </Button>
            </div>
          </div>
          <Controller
            control={control}
            name={`${name}.${index}.content` as const}
            render={() => (
              <RichTextField
                control={control}
                name={`${name}.${index}.content` as const}
                label=""
                placeholder={t('common.question.answer.richPlaceholder', {
                  fallback: 'Enter answer text. You can use formatting...',
                })}
                minHeight="100px"
                disabled={disabled}
              />
            )}
          />
          {!enforceCorrect && (
            <div className="flex items-center gap-2">
              <Controller
                name={`${name}.${index}.correct` as const}
                render={({ field }) => (
                  <>
                    <Switch
                      id={`${name}.${index}.correct`}
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <Label
                      htmlFor={`${name}.${index}.correct`}
                      className="text-sm"
                    >
                      {t('common.question.correct', {
                        fallback: 'Correct',
                      })}
                    </Label>
                  </>
                )}
              />
            </div>
          )}
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
