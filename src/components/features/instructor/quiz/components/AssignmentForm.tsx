'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, Resolver, useForm } from 'react-hook-form';

import React from 'react';

import { useTranslations } from 'next-intl';

import { QuizDataDTO } from '@/components/features/instructor/quiz/types';
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
}

export function AssignmentForm({
  quiz,
  onSuccess,
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

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Responsive grid: stack on mobile, two columns on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Main details */}
          <div className="md:col-span-8 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('instructor.assignment.create.details', {
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
                      <FieldLabel htmlFor="title" className="text-sm">
                        {t('instructor.assignment.create.titleLabel', {
                          default: 'Assignment Title',
                        })}
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="title"
                          className="h-10 w-full"
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
                      <FieldLabel htmlFor="description" className="text-sm">
                        {t('instructor.assignment.create.descriptionLabel', {
                          default: 'Description (optional)',
                        })}
                      </FieldLabel>
                      <FieldContent>
                        <Textarea
                          id="description"
                          rows={4}
                          placeholder={t(
                            'instructor.assignment.create.descriptionPlaceholder',
                            { default: 'Enter assignment description' }
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
          </div>

          {/* Settings sidebar */}
          <div className="md:col-span-4 space-y-4 md:sticky md:top-4 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('instructor.assignment.create.settings', {
                    default: 'Settings',
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    control={form.control}
                    name="startTimeLocal"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="startTimeLocal" className="text-sm">
                          {t('instructor.assignment.create.startTimeLabel', {
                            default: 'Start Time',
                          })}
                        </FieldLabel>
                        <FieldContent>
                          <Input id="startTimeLocal" type="datetime-local" className="h-10 w-full" aria-invalid={!!fieldState.error} aria-describedby={fieldState.error ? 'startTimeLocal-error' : undefined} {...field} />
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
                        <FieldLabel htmlFor="endTimeLocal" className="text-sm">
                          {t('instructor.assignment.create.endTimeLabel', {
                            default: 'End Time',
                          })}
                        </FieldLabel>
                        <FieldContent>
                          <Input id="endTimeLocal" type="datetime-local" className="h-10 w-full" aria-invalid={!!fieldState.error} aria-describedby={fieldState.error ? 'endTimeLocal-error' : undefined} {...field} />
                          <FieldError id="endTimeLocal-error">{fieldState.error?.message}</FieldError>
                        </FieldContent>
                      </Field>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    control={form.control}
                    name="attempt"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="attempt" className="text-sm">
                          {t('instructor.assignment.settings.attempts', {
                            default: 'Max attempts (0 = unlimited)',
                          })}
                        </FieldLabel>
                        <FieldContent>
                          <Input id="attempt" type="number" min={0} step={1} className="h-10 w-full" aria-invalid={!!fieldState.error} aria-describedby={fieldState.error ? 'attempt-error' : undefined} {...field} />
                          <FieldError id="attempt-error">{fieldState.error?.message}</FieldError>
                        </FieldContent>
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="time"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="time" className="text-sm">
                          {t('instructor.assignment.settings.timeLimit', {
                            default: 'Time limit (minutes, 0 = unlimited)',
                          })}
                        </FieldLabel>
                        <FieldContent>
                          <Input id="time" type="number" min={0} step={1} className="h-10 w-full" aria-invalid={!!fieldState.error} aria-describedby={fieldState.error ? 'time-error' : undefined} {...field} />
                          <FieldError id="time-error">{fieldState.error?.message}</FieldError>
                        </FieldContent>
                      </Field>
                    )}
                  />

                  <div className="space-y-3 md:col-span-2">
                    <Controller
                      control={form.control}
                      name="shuffleQuestions"
                      render={({ field, fieldState }) => (
                        <Field className="flex items-center justify-between rounded-lg border px-3 py-3 min-h-12">
                          <div className="space-y-0.5 min-w-0">
                            <FieldLabel htmlFor="shuffleQuestions" className="text-sm">
                              {t(
                                'instructor.assignment.settings.shuffleQuestions',
                                { default: 'Shuffle questions' }
                              )}
                            </FieldLabel>
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
                        <Field className="flex items-center justify-between rounded-lg border px-3 py-3 min-h-12">
                          <div className="space-y-0.5 min-w-0">
                            <FieldLabel htmlFor="shuffleAnswers" className="text-sm">
                              {t(
                                'instructor.assignment.settings.shuffleAnswers',
                                { default: 'Shuffle answers' }
                              )}
                            </FieldLabel>
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

                  <Controller
                    control={form.control}
                    name="resultShowType"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="resultShowType" className="text-sm">
                          {t('instructor.assignment.settings.resultShowType.label', {
                            default: 'When to show results',
                          })}
                        </FieldLabel>
                        <FieldContent>
                          <Select
                            value={String(field.value)}
                            onValueChange={(v) => field.onChange(v as AssignmentResultShowType)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={AssignmentResultShowType.AFTER_ASSIGNMENT}>
                                {t('instructor.assignment.settings.resultShowType.afterAssignment', {
                                  default: 'After assignment',
                                })}
                              </SelectItem>
                              <SelectItem value={AssignmentResultShowType.AFTER_EACH_ATTEMPT}>
                                {t('instructor.assignment.settings.resultShowType.afterEachAttempt', {
                                  default: 'After each attempt',
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
                        </FieldContent>
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="resultType"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="resultType" className="text-sm">
                          {t('instructor.assignment.settings.resultType.label', {
                            default: 'Result details',
                          })}
                        </FieldLabel>
                        <FieldContent>
                          <Select
                            value={String(field.value)}
                            onValueChange={(v) => field.onChange(v as AssignmentResultType)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={AssignmentResultType.ONLY_CORRECT}>
                                {t('instructor.assignment.settings.resultType.onlyCorrect', {
                                  default: 'Only correct answers',
                                })}
                              </SelectItem>
                              <SelectItem value={AssignmentResultType.ALL_ANSWERS}>
                                {t('instructor.assignment.settings.resultType.allAnswers', {
                                  default: 'All answers',
                                })}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FieldError id="resultType-error">{fieldState.error?.message}</FieldError>
                        </FieldContent>
                      </Field>
                    )}
                  />
                </div>

                <SubmitButton
                  isSubmitting={isSubmitting}
                  submitText={t('common.create', { default: 'Create' })}
                  loadingText={t('common.creating', {
                    default: 'Creating...',
                  })}
                  className="w-full md:w-auto"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}

export default AssignmentForm;
