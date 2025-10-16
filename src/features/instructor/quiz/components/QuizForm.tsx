'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';

import { TQuizFormData, quizFormSchema } from '../schemas/quizSchema';
import {
  InstructorQuizCreateRequest,
  InstructorQuizUpdateRequest,
  QuizDataDTO,
} from '../types/quiz';

export interface QuizFormProps {
  quiz?: QuizDataDTO;
  onSubmit: (
    data: InstructorQuizCreateRequest | InstructorQuizUpdateRequest
  ) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
  hideTitle?: boolean;
}

export function QuizForm({
  quiz,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
  hideTitle = false,
}: Readonly<QuizFormProps>) {
  const t = useTranslations();

  const form = useForm<TQuizFormData>({
    resolver: zodResolver(quizFormSchema) as Resolver<TQuizFormData>,
    defaultValues: {
      title: quiz?.title || '',
      description: quiz?.description || '',
      settings: {
        time: quiz?.settings?.time ?? 0,
        attempt: quiz?.settings?.attempt ?? 0,
        shuffleQuestions: quiz?.settings?.shuffleQuestions ?? false,
        shuffleAnswers: quiz?.settings?.shuffleAnswers ?? false,
      },
    },
  });

  const handleFormSubmit = async (data: TQuizFormData) => {
    const submitData:
      | InstructorQuizCreateRequest
      | InstructorQuizUpdateRequest = {
      ...data,
      settings: {
        time: data.settings.time ?? 0,
        attempt: data.settings.attempt ?? 0,
        shuffleQuestions: data.settings.shuffleQuestions || false,
        shuffleAnswers: data.settings.shuffleAnswers || false,
      },
    };

    if (quiz) {
      (submitData as InstructorQuizUpdateRequest).id = quiz.id;
    }

    await onSubmit(submitData);
  };

  return (
    <Card className={className}>
      {!hideTitle && (
        <CardHeader>
          <CardTitle>
            {quiz
              ? t('instructor.quiz.form.editTitle', { default: 'Edit Quiz' })
              : t('instructor.quiz.form.createTitle', {
                  default: 'Create New Quiz',
                })}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="title">
                    {t('instructor.quiz.form.title', { default: 'Quiz Title' })}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="title"
                      placeholder={t('instructor.quiz.form.titlePlaceholder', {
                        fallback: 'Enter quiz title...',
                      })}
                      disabled={isSubmitting}
                      aria-invalid={!!fieldState.error}
                      aria-describedby={fieldState.error ? 'title-error' : undefined}
                      {...field}
                    />
                    <FieldError id="title-error">{fieldState.error?.message}</FieldError>
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="description">
                    {t('instructor.quiz.form.description', {
                      fallback: 'Description',
                    })}
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      id="description"
                      placeholder={t(
                        'instructor.quiz.form.descriptionPlaceholder',
                        {
                          fallback: 'Enter quiz description...',
                        }
                      )}
                      disabled={isSubmitting}
                      rows={3}
                      aria-invalid={!!fieldState.error}
                      aria-describedby={fieldState.error ? 'description-error' : undefined}
                      {...field}
                    />
                    <FieldError id="description-error">{fieldState.error?.message}</FieldError>
                  </FieldContent>
                </Field>
              )}
            />
          </div>

          <Separator />

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t('instructor.quiz.form.settings', {
                fallback: 'Quiz Settings',
              })}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="settings.time"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="time">
                      {t('instructor.quiz.form.timeLimit', {
                        fallback: 'Time Limit (minutes)',
                      })}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="time"
                        type="number"
                        min={0}
                        placeholder="0"
                        disabled={isSubmitting}
                        value={field.value as number | string}
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        aria-invalid={!!fieldState.error}
                        aria-describedby={fieldState.error ? 'time-error' : undefined}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('instructor.quiz.form.timeLimitHelp', {
                          fallback: '0 means unlimited time',
                        })}
                      </p>
                      <FieldError id="time-error">{fieldState.error?.message}</FieldError>
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                name="settings.attempt"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="attempt">
                      {t('instructor.quiz.form.maxAttempts', {
                        fallback: 'Max Attempts',
                      })}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="attempt"
                        type="number"
                        min={0}
                        placeholder="0"
                        disabled={isSubmitting}
                        value={field.value as number | string}
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        aria-invalid={!!fieldState.error}
                        aria-describedby={fieldState.error ? 'attempt-error' : undefined}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('instructor.quiz.form.maxAttemptsHelp', {
                          fallback: '0 means unlimited attempts',
                        })}
                      </p>
                      <FieldError id="attempt-error">{fieldState.error?.message}</FieldError>
                    </FieldContent>
                  </Field>
                )}
              />
            </div>

            <div className="space-y-4">
              <Controller
                name="settings.shuffleQuestions"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="flex items-center justify-between rounded-lg border px-3 py-3 min-h-12">
                    <div className="space-y-0.5 min-w-0">
                      <FieldLabel htmlFor="shuffleQuestions" className="text-sm">
                        {t('instructor.quiz.form.shuffleQuestions', {
                          fallback: 'Shuffle Questions',
                        })}
                      </FieldLabel>
                      <p className="text-xs text-muted-foreground m-0">
                        {t('instructor.quiz.form.shuffleQuestionsHelp', {
                          fallback: 'Randomize the order of questions for each attempt',
                        })}
                      </p>
                    </div>
                    <FieldContent>
                      <Switch
                        id="shuffleQuestions"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                        aria-invalid={!!fieldState.error}
                        aria-describedby={fieldState.error ? 'shuffleQuestions-error' : undefined}
                      />
                      <FieldError id="shuffleQuestions-error">{fieldState.error?.message}</FieldError>
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                name="settings.shuffleAnswers"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="flex items-center justify-between rounded-lg border px-3 py-3 min-h-12">
                    <div className="space-y-0.5 min-w-0">
                      <FieldLabel htmlFor="shuffleAnswers" className="text-sm">
                        {t('instructor.quiz.form.shuffleAnswers', {
                          fallback: 'Shuffle Answers',
                        })}
                      </FieldLabel>
                      <p className="text-xs text-muted-foreground m-0">
                        {t('instructor.quiz.form.shuffleAnswersHelp', {
                          fallback: 'Randomize the order of answer choices',
                        })}
                      </p>
                    </div>
                    <FieldContent>
                      <Switch
                        id="shuffleAnswers"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                        aria-invalid={!!fieldState.error}
                        aria-describedby={fieldState.error ? 'shuffleAnswers-error' : undefined}
                      />
                      <FieldError id="shuffleAnswers-error">{fieldState.error?.message}</FieldError>
                    </FieldContent>
                  </Field>
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {t('common.cancel', { fallback: 'Cancel' })}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting
                ? quiz
                  ? t('common.updating', { fallback: 'Updating...' })
                  : t('common.creating', { fallback: 'Creating...' })
                : quiz
                  ? t('common.update', { fallback: 'Update' })
                  : t('common.create', { fallback: 'Create' })}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
