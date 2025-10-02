'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

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
}

export function QuizForm({
  quiz,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
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
      <CardHeader>
        <CardTitle>
          {quiz
            ? t('instructor.quiz.form.editTitle', { fallback: 'Edit Quiz' })
            : t('instructor.quiz.form.createTitle', {
                fallback: 'Create New Quiz',
              })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                {t('instructor.quiz.form.title', { fallback: 'Quiz Title' })}
              </Label>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      id="title"
                      placeholder={t('instructor.quiz.form.titlePlaceholder', {
                        fallback: 'Enter quiz title...',
                      })}
                      disabled={isSubmitting}
                    />
                    {fieldState.error && (
                      <p className="text-sm text-destructive mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t('instructor.quiz.form.description', {
                  fallback: 'Description',
                })}
              </Label>
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Textarea
                      {...field}
                      id="description"
                      placeholder={t(
                        'instructor.quiz.form.descriptionPlaceholder',
                        {
                          fallback: 'Enter quiz description...',
                        }
                      )}
                      disabled={isSubmitting}
                      rows={3}
                    />
                    {fieldState.error && (
                      <p className="text-sm text-destructive mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
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
              <div className="space-y-2">
                <Label htmlFor="time">
                  {t('instructor.quiz.form.timeLimit', {
                    fallback: 'Time Limit (minutes)',
                  })}
                </Label>
                <Controller
                  name="settings.time"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        id="time"
                        type="number"
                        min="0"
                        placeholder="0"
                        disabled={isSubmitting}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                      {fieldState.error && (
                        <p className="text-sm text-destructive mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('instructor.quiz.form.timeLimitHelp', {
                          fallback: '0 means unlimited time',
                        })}
                      </p>
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attempt">
                  {t('instructor.quiz.form.maxAttempts', {
                    fallback: 'Max Attempts',
                  })}
                </Label>
                <Controller
                  name="settings.attempt"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        id="attempt"
                        type="number"
                        min="0"
                        placeholder="0"
                        disabled={isSubmitting}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                      {fieldState.error && (
                        <p className="text-sm text-destructive mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('instructor.quiz.form.maxAttemptsHelp', {
                          fallback: '0 means unlimited attempts',
                        })}
                      </p>
                    </div>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="shuffleQuestions">
                    {t('instructor.quiz.form.shuffleQuestions', {
                      fallback: 'Shuffle Questions',
                    })}
                  </Label>
                  <p className="text-xs text-muted-foreground m-0">
                    {t('instructor.quiz.form.shuffleQuestionsHelp', {
                      fallback:
                        'Randomize the order of questions for each attempt',
                    })}
                  </p>
                </div>
                <Controller
                  name="settings.shuffleQuestions"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      id="shuffleQuestions"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="shuffleAnswers">
                    {t('instructor.quiz.form.shuffleAnswers', {
                      fallback: 'Shuffle Answers',
                    })}
                  </Label>
                  <p className="text-xs text-muted-foreground m-0">
                    {t('instructor.quiz.form.shuffleAnswersHelp', {
                      fallback: 'Randomize the order of answer choices',
                    })}
                  </p>
                </div>
                <Controller
                  name="settings.shuffleAnswers"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      id="shuffleAnswers"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>
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
