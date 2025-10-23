'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, Resolver, useForm } from 'react-hook-form';

import React from 'react';

import { useTranslations } from 'next-intl';

import { QuizDataDTO } from '@/features/instructor/quiz/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { useCreateAssignment } from '../../analytics/hooks/useCreateAssignment';
import {
  TAssignmentStartUIForm,
  assignmentStartUISchema,
  toAssignmentCreateRequest,
} from '../../analytics/schemas/assignmentStartUiSchema';
import {
  AssignmentResultShowType,
  AssignmentResultType,
} from '../../analytics/types/assignment';

export interface AssignmentFormProps {
  quiz: QuizDataDTO;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AssignmentForm({
  quiz,
  onSuccess,
  onCancel,
}: Readonly<AssignmentFormProps>) {
  const t = useTranslations();
  const createAssignment = useCreateAssignment();

  const now = React.useMemo(() => new Date(), []);
  const threeHourLater = React.useMemo(
    () => new Date(now.getTime() + 180 * 60 * 1000),
    [now]
  );

  const form = useForm<TAssignmentStartUIForm>({
    resolver: zodResolver(
      assignmentStartUISchema
    ) as Resolver<TAssignmentStartUIForm>,
    defaultValues: {
      title: `${quiz.title} - ${t('instructor.assignment.defaultSuffix', {
        default: 'Assignment',
      })}`,
      description: quiz.description || '',
      startTimeLocal: now.toISOString().slice(0, 16),
      endTimeLocal: threeHourLater.toISOString().slice(0, 16),
      attempt: quiz.settings.attempt || 0,
      time: quiz.settings.time || 0,
      shuffleQuestions: quiz.settings.shuffleQuestions ?? false,
      shuffleAnswers: quiz.settings.shuffleAnswers ?? false,
      resultShowType: AssignmentResultShowType.AFTER_ASSIGNMENT,
      resultType: AssignmentResultType.ONLY_CORRECT,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = toAssignmentCreateRequest(quiz.id, values);
    await createAssignment.mutateAsync(payload);
    form.reset();
    onSuccess?.();
  });

  const isSubmitting = createAssignment.isPending;
  const startImmediately = form.watch('startImmediately');

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Main details card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('common.details', {
                default: 'Details',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="title" className="text-sm font-medium">
                    {t('common.title', {
                      default: 'Title',
                    })}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="title"
                      className="h-11 w-full"
                      placeholder={t(
                        'instructor.assignment.create.titlePlaceholder',
                        { default: 'Enter assignment title' }
                      )}
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
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="description" className="text-sm font-medium">
                    {t('common.description', {
                      default: 'Description',
                    })}
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      id="description"
                      rows={3}
                      placeholder={t(
                        'instructor.assignment.create.descriptionPlaceholder',
                        { default: 'Provide additional details or instructions for students' }
                      )}
                      aria-invalid={!!fieldState.error}
                      aria-describedby={fieldState.error ? 'description-error' : undefined}
                      {...field}
                    />
                    <FieldError id="description-error">{fieldState.error?.message}</FieldError>
                  </FieldContent>
                </Field>
              )}
            />
          </CardContent>
        </Card>

        {/* Timing settings card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('common.settings', {
                default: 'Settings',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              control={form.control}
              name="startImmediately"
              render={({ field, fieldState }) => (
                <Field className="flex items-center justify-between rounded-lg border px-4 py-4 min-h-14 bg-muted/30">
                  <div className="space-y-1 min-w-0 pr-4">
                    <FieldLabel htmlFor="startImmediately" className="text-sm font-medium">
                      {t('instructor.assignment.create.startImmediately', {
                        default: 'Start immediately',
                      })}
                    </FieldLabel>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t('instructor.assignment.create.startImmediatelyHelp', {
                        default: 'Begin assignment right away. Start time will be set automatically.',
                      })}
                    </p>
                  </div>
                  <FieldContent>
                    <Switch
                      id="startImmediately"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={!!fieldState.error}
                      aria-describedby={fieldState.error ? 'startImmediately-error' : undefined}
                    />
                    <FieldError id="startImmediately-error">{fieldState.error?.message}</FieldError>
                  </FieldContent>
                </Field>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="startTimeLocal"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="startTimeLocal" className="text-sm font-medium">
                      {t('common.startTime', {
                        default: 'Start Time',
                      })}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="startTimeLocal"
                        type="datetime-local"
                        className="h-11 w-full"
                        min={now.toISOString().slice(0, 16)}
                        disabled={startImmediately || isSubmitting}
                        aria-invalid={!!fieldState.error}
                        aria-describedby={fieldState.error ? 'startTimeLocal-error' : undefined}
                        {...field}
                      />
                      <FieldError id="startTimeLocal-error">{fieldState.error?.message}</FieldError>
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="endTimeLocal"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="endTimeLocal" className="text-sm font-medium">
                      {t('common.endTime', {
                        default: 'End Time',
                      })}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="endTimeLocal"
                        type="datetime-local"
                        className="h-11 w-full"
                        aria-invalid={!!fieldState.error}
                        aria-describedby={fieldState.error ? 'endTimeLocal-error' : undefined}
                        {...field}
                      />
                      <FieldError id="endTimeLocal-error">{fieldState.error?.message}</FieldError>
                      {fieldState.error && (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {t('instructor.assignment.create.endTimeHelp', {
                            default: 'Must be after the start time',
                          })}
                        </p>
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiz settings card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('common.settings', {
                default: 'Settings',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="attempt"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="attempt" className="text-sm font-medium">
                      {t('instructor.assignment.settings.attempts', {
                        default: 'Max Attempts',
                      })}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="attempt"
                        type="number"
                        min={0}
                        step={1}
                        className="h-11 w-full"
                        placeholder="0 = unlimited"
                        aria-invalid={!!fieldState.error}
                        aria-describedby={fieldState.error ? 'attempt-error' : undefined}
                        {...field}
                      />
                      <FieldError id="attempt-error">{fieldState.error?.message}</FieldError>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {t('instructor.assignment.settings.attemptsHelp', {
                          default: '0 means unlimited attempts',
                        })}
                      </p>
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="time"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="time" className="text-sm font-medium">
                      {t('instructor.assignment.settings.timeLimit', {
                        default: 'Time Limit (minutes)',
                      })}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="time"
                        type="number"
                        min={0}
                        step={1}
                        className="h-11 w-full"
                        placeholder="0 = unlimited"
                        aria-invalid={!!fieldState.error}
                        aria-describedby={fieldState.error ? 'time-error' : undefined}
                        {...field}
                      />
                      <FieldError id="time-error">{fieldState.error?.message}</FieldError>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {t('instructor.assignment.settings.timeLimitHelp', {
                          default: '0 means no time limit',
                        })}
                      </p>
                    </FieldContent>
                  </Field>
                )}
              />
            </div>

            <div className="space-y-3">
              <Controller
                control={form.control}
                name="shuffleQuestions"
                render={({ field, fieldState }) => (
                  <Field className="flex items-center justify-between rounded-lg border px-4 py-3.5 min-h-14">
                    <div className="space-y-0.5 min-w-0">
                      <FieldLabel htmlFor="shuffleQuestions" className="text-sm font-medium">
                        {t(
                          'instructor.assignment.settings.shuffleQuestions',
                          { default: 'Shuffle questions' }
                        )}
                      </FieldLabel>
                      <p className="text-xs text-muted-foreground">
                        {t('instructor.assignment.settings.shuffleQuestionsHelp', {
                          default: 'Randomize the order of questions',
                        })}
                      </p>
                    </div>
                    <FieldContent>
                      <Switch
                        id="shuffleQuestions"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={!!fieldState.error}
                        aria-describedby={fieldState.error ? 'shuffleQuestions-error' : undefined}
                      />
                      <FieldError id="shuffleQuestions-error">{fieldState.error?.message}</FieldError>
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="shuffleAnswers"
                render={({ field, fieldState }) => (
                  <Field className="flex items-center justify-between rounded-lg border px-4 py-3.5 min-h-14">
                    <div className="space-y-0.5 min-w-0">
                      <FieldLabel htmlFor="shuffleAnswers" className="text-sm font-medium">
                        {t(
                          'instructor.assignment.settings.shuffleAnswers',
                          { default: 'Shuffle answers' }
                        )}
                      </FieldLabel>
                      <p className="text-xs text-muted-foreground">
                        {t('instructor.assignment.settings.shuffleAnswersHelp', {
                          default: 'Randomize the order of answer choices',
                        })}
                      </p>
                    </div>
                    <FieldContent>
                      <Switch
                        id="shuffleAnswers"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={!!fieldState.error}
                        aria-describedby={fieldState.error ? 'shuffleAnswers-error' : undefined}
                      />
                      <FieldError id="shuffleAnswers-error">{fieldState.error?.message}</FieldError>
                    </FieldContent>
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results settings card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('common.settings', {
                default: 'Settings',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="resultShowType"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="resultShowType" className="text-sm font-medium">
                      {t('instructor.assignment.settings.resultShowType.label', {
                        default: 'When to Show Results',
                      })}
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(v as AssignmentResultShowType)}
                      >
                        <SelectTrigger className="w-full h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={AssignmentResultShowType.IMMEDIATELY}>
                            {t('instructor.assignment.settings.resultShowType.immediately', {
                              default: 'Immediately',
                            })}
                          </SelectItem>
                          <SelectItem value={AssignmentResultShowType.AFTER_ASSIGNMENT}>
                            {t('instructor.assignment.settings.resultShowType.afterAssignment', {
                              default: 'After assignment ends',
                            })}
                          </SelectItem>
                          <SelectItem value={AssignmentResultShowType.NEVER}>
                            {t('instructor.assignment.settings.resultShowType.never', {
                              default: 'Never',
                            })}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError id="resultShowType-error">{fieldState.error?.message}</FieldError>
                      {field.value === AssignmentResultShowType.NEVER && (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {t('instructor.assignment.settings.resultShowType.helper.never', {
                            default: 'Students will not see their results',
                          })}
                        </p>
                      )}
                      {field.value === AssignmentResultShowType.AFTER_ASSIGNMENT && (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {t('instructor.assignment.settings.resultShowType.helper.after', {
                            default: 'Results shown after assignment deadline',
                          })}
                        </p>
                      )}
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="resultType"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="resultType" className="text-sm font-medium">
                      {t('instructor.assignment.settings.resultType.label', {
                        default: 'Result Details',
                      })}
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(v as AssignmentResultType)}
                      >
                        <SelectTrigger className="w-full h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={AssignmentResultType.ONLY_RESULT}>
                            {t('instructor.assignment.settings.resultType.onlyResult', {
                              default: 'Score only',
                            })}
                          </SelectItem>
                          <SelectItem value={AssignmentResultType.ONLY_CORRECT}>
                            {t('instructor.assignment.settings.resultType.onlyCorrect', {
                              default: 'Score + correct answers',
                            })}
                          </SelectItem>
                          <SelectItem value={AssignmentResultType.FULL}>
                            {t('instructor.assignment.settings.resultType.full', {
                              default: 'Full details',
                            })}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError id="resultType-error">{fieldState.error?.message}</FieldError>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {t('instructor.assignment.settings.resultType.help', {
                          default: 'What information students can see',
                        })}
                      </p>
                    </FieldContent>
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit and Cancel buttons - prominently placed at the bottom */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 h-11"
          >
            {t('common.cancel', { default: 'Cancel' })}
          </Button>
          <SubmitButton
            isSubmitting={isSubmitting}
            submitText={t('instructor.assignment.create.submit', { default: 'Create Assignment' })}
            loadingText={t('common.creating', {
              default: 'Creating...',
            })}
            className="w-full sm:w-auto px-8 h-11"
          />
        </div>
      </form>
    </Form>
  );
}

export default AssignmentForm;
