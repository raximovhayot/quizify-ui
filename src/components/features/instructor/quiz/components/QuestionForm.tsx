'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import {
  TInstructorQuestionForm,
  instructorQuestionFormSchema, // toInstructorQuestionSaveRequest, // Unused - available for future use
} from '../schemas/questionSchema';
import { QuestionDataDto, QuestionType } from '../types/question';
import { AnswerListEditor } from './answers/AnswerListEditor';

export interface QuestionFormProps {
  quizId: number;
  onSubmit: (data: TInstructorQuestionForm) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  initialData?: QuestionDataDto;
  fixedType?: QuestionType; // when provided, hide type selector and enforce this type
}

export function QuestionForm({
  quizId,
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
  fixedType,
}: Readonly<QuestionFormProps>) {
  const t = useTranslations();

  const form = useForm<TInstructorQuestionForm>({
    resolver: zodResolver(instructorQuestionFormSchema),
    defaultValues: initialData
      ? ({
          quizId,
          questionType: (fixedType ?? initialData.questionType) as QuestionType,
          content: initialData.content,
          explanation: initialData.explanation || '',
          order: initialData.order,
          points: initialData.points,
          // Per-type defaults from initialData
          ...(initialData.questionType === QuestionType.TRUE_FALSE
            ? {
                trueFalseAnswer: initialData.trueFalseAnswer ?? false,
                answers: [],
              }
            : {}),
          ...(initialData.questionType === QuestionType.FILL_IN_BLANK
            ? { blankTemplate: initialData.blankTemplate ?? '', answers: [] }
            : {}),
          ...(initialData.questionType === QuestionType.ESSAY
            ? {
                gradingCriteria: initialData.gradingCriteria ?? '',
                answers: [],
              }
            : {}),
          ...(initialData.questionType === QuestionType.MATCHING
            ? {
                matchingPairs: (() => {
                  try {
                    const parsed = initialData.matchingConfig
                      ? JSON.parse(initialData.matchingConfig)
                      : [];
                    if (Array.isArray(parsed)) {
                      return parsed.map((p: any) => ({
                        left: String(p.left ?? ''),
                        right: String(p.right ?? ''),
                      }));
                    }
                  } catch {}
                  return [{ left: '', right: '' }];
                })(),
                answers: [],
              }
            : {}),
          ...(initialData.questionType === QuestionType.RANKING
            ? {
                rankingItems: (() => {
                  try {
                    const parsed = initialData.correctOrder
                      ? JSON.parse(initialData.correctOrder)
                      : [];
                    return Array.isArray(parsed)
                      ? parsed.map((x: any) => String(x))
                      : [];
                  } catch {
                    return [];
                  }
                })(),
                answers: [],
              }
            : {}),
          // For types that use answers directly (MCQ/Short Answer)
          ...(initialData.questionType === QuestionType.MULTIPLE_CHOICE ||
          initialData.questionType === QuestionType.SHORT_ANSWER
            ? {
                answers: initialData.answers.map((answer) => ({
                  id: answer.id,
                  content: answer.content,
                  correct: answer.correct,
                  order: answer.order,
                })),
              }
            : {}),
        } as unknown as TInstructorQuestionForm)
      : (() => {
          const typeToUse = (fixedType ??
            QuestionType.MULTIPLE_CHOICE) as QuestionType;
          const base = {
            quizId,
            questionType: typeToUse,
            content: '',
            explanation: '',
            order: 0,
            points: 1,
          } as const;
          switch (typeToUse) {
            case QuestionType.MULTIPLE_CHOICE:
              return {
                ...base,
                answers: [
                  { content: '', correct: true, order: 0 },
                  { content: '', correct: false, order: 1 },
                ],
              } as unknown as TInstructorQuestionForm;
            case QuestionType.TRUE_FALSE:
              return {
                ...base,
                trueFalseAnswer: false,
                answers: [],
              } as unknown as TInstructorQuestionForm;
            case QuestionType.SHORT_ANSWER:
              return {
                ...base,
                answers: [{ content: '', correct: true, order: 0 }],
              } as unknown as TInstructorQuestionForm;
            case QuestionType.FILL_IN_BLANK:
              return {
                ...base,
                blankTemplate: '',
                answers: [],
              } as unknown as TInstructorQuestionForm;
            case QuestionType.ESSAY:
              return {
                ...base,
                gradingCriteria: '',
                answers: [],
              } as unknown as TInstructorQuestionForm;
            case QuestionType.MATCHING:
              return {
                ...base,
                matchingPairs: [{ left: '', right: '' }],
                answers: [],
              } as unknown as TInstructorQuestionForm;
            case QuestionType.RANKING:
              return {
                ...base,
                rankingItems: ['', ''],
                answers: [],
              } as unknown as TInstructorQuestionForm;
            default:
              return {
                ...base,
                answers: [],
              } as unknown as TInstructorQuestionForm;
          }
        })(),
  });

  const type = form.watch('questionType');

  const submit = async (data: TInstructorQuestionForm) => {
    await onSubmit(data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {!fixedType && (
            <div>
              <Label htmlFor="questionType">
                {t('instructor.quiz.question.type.label', {
                  fallback: 'Question type',
                })}
              </Label>
              <Controller
                name="questionType"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="questionType">
                      <SelectValue
                        placeholder={t(
                          'instructor.quiz.question.type.placeholder',
                          { fallback: 'Select type' }
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={QuestionType.MULTIPLE_CHOICE}>
                        {t('instructor.quiz.question.type.multipleChoice', {
                          fallback: 'Multiple Choice',
                        })}
                      </SelectItem>
                      <SelectItem value={QuestionType.TRUE_FALSE}>
                        {t('instructor.quiz.question.type.trueFalse', {
                          fallback: 'True/False',
                        })}
                      </SelectItem>
                      <SelectItem value={QuestionType.SHORT_ANSWER}>
                        {t('instructor.quiz.question.type.shortAnswer', {
                          fallback: 'Short Answer',
                        })}
                      </SelectItem>
                      <SelectItem value={QuestionType.FILL_IN_BLANK}>
                        {t('instructor.quiz.question.type.fillInBlank', {
                          fallback: 'Fill in the blank',
                        })}
                      </SelectItem>
                      <SelectItem value={QuestionType.ESSAY}>
                        {t('instructor.quiz.question.type.essay', {
                          fallback: 'Essay',
                        })}
                      </SelectItem>
                      <SelectItem value={QuestionType.MATCHING}>
                        {t('instructor.quiz.question.type.matching', {
                          fallback: 'Matching',
                        })}
                      </SelectItem>
                      <SelectItem value={QuestionType.RANKING}>
                        {t('instructor.quiz.question.type.ranking', {
                          fallback: 'Ranking',
                        })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
          <div className={!fixedType ? '' : 'md:col-span-2'}>
            <Label htmlFor="points">
              {t('instructor.quiz.question.points', { fallback: 'Points' })}
            </Label>
            <Input
              id="points"
              type="number"
              min={0}
              {...form.register('points', { valueAsNumber: true })}
            />
            {form.formState.errors.points && (
              <p className="text-sm text-destructive mt-1">
                {String((form.formState.errors as any).points?.message)}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="content">
            {t('instructor.quiz.question.content', { fallback: 'Question' })}
          </Label>
          <Textarea id="content" rows={3} {...form.register('content')} />
          {form.formState.errors.content && (
            <p className="text-sm text-destructive mt-1">
              {String(form.formState.errors.content.message)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="explanation">
            {t('instructor.quiz.question.explanation.label', {
              fallback: 'Explanation (optional)',
            })}
          </Label>
          <Textarea
            id="explanation"
            rows={3}
            placeholder={t('instructor.quiz.question.explanation.placeholder', {
              fallback:
                'Add an explanation or feedback shown after answering (optional)',
            })}
            {...form.register('explanation')}
          />
          {/* No strict validation for explanation, but display if any */}
          {(form.formState.errors as any)?.explanation?.message && (
            <p className="text-sm text-destructive mt-1">
              {String((form.formState.errors as any)?.explanation?.message)}
            </p>
          )}
        </div>

        {/* Conditional sections */}
        {type === QuestionType.MULTIPLE_CHOICE && (
          <div className="space-y-2">
            <Label>
              {t('instructor.quiz.question.answers', { fallback: 'Answers' })}
            </Label>
            <AnswerListEditor disabled={isSubmitting} />
            {(form.formState.errors as any)?.answers?.message && (
              <p className="text-sm text-destructive mt-1">
                {String((form.formState.errors as any)?.answers?.message)}
              </p>
            )}
          </div>
        )}
        {type === QuestionType.SHORT_ANSWER && (
          <div className="space-y-2">
            <Label>
              {t('instructor.quiz.question.answers', { fallback: 'Answers' })}
            </Label>
            <AnswerListEditor enforceCorrect disabled={isSubmitting} />
            {(form.formState.errors as any)?.answers?.message && (
              <p className="text-sm text-destructive mt-1">
                {String((form.formState.errors as any)?.answers?.message)}
              </p>
            )}
          </div>
        )}
        {type === QuestionType.TRUE_FALSE && (
          <div className="flex items-center gap-2">
            <Controller
              name="trueFalseAnswer"
              control={form.control}
              render={({ field }) => (
                <>
                  <Switch
                    id="trueFalseAnswer"
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="trueFalseAnswer">
                    {t('instructor.quiz.question.trueFalse.correctIsTrue', {
                      fallback: 'Correct is True',
                    })}
                  </Label>
                </>
              )}
            />
          </div>
        )}
        {type === QuestionType.FILL_IN_BLANK && (
          <div>
            <Label htmlFor="blankTemplate">
              {t('instructor.quiz.question.fillInBlank.template', {
                fallback: 'Template',
              })}
            </Label>
            <Textarea
              id="blankTemplate"
              rows={3}
              {...form.register('blankTemplate')}
            />
          </div>
        )}
        {type === QuestionType.ESSAY && (
          <div>
            <Label htmlFor="gradingCriteria">
              {t('instructor.quiz.question.essay.criteria', {
                fallback: 'Grading criteria',
              })}
            </Label>
            <Textarea
              id="gradingCriteria"
              rows={3}
              {...form.register('gradingCriteria')}
            />
          </div>
        )}
        {type === QuestionType.MATCHING && <MatchingEditor />}
        {type === QuestionType.RANKING && <RankingEditor />}

        <Separator />

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t('common.cancel', { fallback: 'Cancel' })}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t('common.saving', { fallback: 'Saving...' })
              : t('common.create', { fallback: 'Create' })}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

function MatchingEditor() {
  const t = useTranslations();
  type TMatchingForm = TInstructorQuestionForm & {
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
  return (
    <div className="space-y-2">
      <Label>
        {t('instructor.quiz.question.matching.pairs', {
          fallback: 'Matching pairs',
        })}
      </Label>
      <div className="space-y-2">
        {pairs.map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center"
          >
            <Input
              className="sm:col-span-2"
              placeholder={t('common.left', { fallback: 'Left' })}
              {...register(`matchingPairs.${index}.left` as const)}
            />
            <Input
              className="sm:col-span-2"
              placeholder={t('common.right', { fallback: 'Right' })}
              {...register(`matchingPairs.${index}.right` as const)}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleRemove(index)}
            >
              {t('common.remove', { fallback: 'Remove' })}
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={handleAdd}>
          {t('common.add', { fallback: 'Add' })}
        </Button>
        {((formState.errors as any)?.matchingPairs?.message ||
          (formState.errors as any)?.matchingPairs?.root?.message) && (
          <p className="text-sm text-destructive mt-1">
            {String(
              (formState.errors as any)?.matchingPairs?.message ||
                (formState.errors as any)?.matchingPairs?.root?.message
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function RankingEditor() {
  const t = useTranslations();
  type TRankingForm = TInstructorQuestionForm & { rankingItems: string[] };
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
  return (
    <div className="space-y-2">
      <Label>
        {t('instructor.quiz.question.ranking.items', {
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
        {((formState.errors as any)?.rankingItems?.message ||
          (formState.errors as any)?.rankingItems?.root?.message) && (
          <p className="text-sm text-destructive mt-1">
            {String(
              (formState.errors as any)?.rankingItems?.message ||
                (formState.errors as any)?.rankingItems?.root?.message
            )}
          </p>
        )}
      </div>
    </div>
  );
}
