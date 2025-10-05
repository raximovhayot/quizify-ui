'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Resolver, useForm } from 'react-hook-form';

import React from 'react';

import { useTranslations } from 'next-intl';

import { QuizDataDTO } from '@/components/features/instructor/quiz/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
        fallback: 'Assignment',
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Main details */}
          <div className="md:col-span-8 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('instructor.assignment.create.details', {
                    fallback: 'Details',
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('instructor.assignment.create.titleLabel', {
                          fallback: 'Assignment Title',
                        })}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'instructor.assignment.create.titlePlaceholder',
                            { fallback: 'Enter assignment title' }
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('instructor.assignment.create.descriptionLabel', {
                          fallback: 'Description (optional)',
                        })}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder={t(
                            'instructor.assignment.create.descriptionPlaceholder',
                            { fallback: 'Enter assignment description' }
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTimeLocal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('instructor.assignment.create.startTimeLabel', {
                            fallback: 'Start Time',
                          })}
                        </FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTimeLocal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('instructor.assignment.create.endTimeLabel', {
                            fallback: 'End Time',
                          })}
                        </FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings sidebar */}
          <div className="md:col-span-4 space-y-4 md:sticky md:top-4 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('instructor.assignment.create.settings', {
                    fallback: 'Settings',
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="attempt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('instructor.assignment.settings.attempts', {
                            fallback: 'Max attempts (0 = unlimited)',
                          })}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('instructor.assignment.settings.timeLimit', {
                            fallback: 'Time limit (minutes, 0 = unlimited)',
                          })}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="shuffleQuestions"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>
                              {t(
                                'instructor.assignment.settings.shuffleQuestions',
                                { fallback: 'Shuffle questions' }
                              )}
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shuffleAnswers"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>
                              {t(
                                'instructor.assignment.settings.shuffleAnswers',
                                { fallback: 'Shuffle answers' }
                              )}
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="resultShowType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('instructor.assignment.settings.resultShowType', {
                            fallback: 'When to show results',
                          })}
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={String(field.value)}
                            onValueChange={(v) =>
                              field.onChange(v as AssignmentResultShowType)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value={
                                  AssignmentResultShowType.AFTER_ASSIGNMENT
                                }
                              >
                                {t(
                                  'instructor.assignment.settings.resultShowType.afterAssignment',
                                  { fallback: 'After assignment' }
                                )}
                              </SelectItem>
                              <SelectItem
                                value={
                                  AssignmentResultShowType.AFTER_EACH_ATTEMPT
                                }
                              >
                                {t(
                                  'instructor.assignment.settings.resultShowType.afterEachAttempt',
                                  { fallback: 'After each attempt' }
                                )}
                              </SelectItem>
                              <SelectItem
                                value={AssignmentResultShowType.NEVER}
                              >
                                {t(
                                  'instructor.assignment.settings.resultShowType.never',
                                  {
                                    fallback: 'Never',
                                  }
                                )}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resultType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('instructor.assignment.settings.resultType', {
                            fallback: 'Result details',
                          })}
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={String(field.value)}
                            onValueChange={(v) =>
                              field.onChange(v as AssignmentResultType)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value={AssignmentResultType.ONLY_CORRECT}
                              >
                                {t(
                                  'instructor.assignment.settings.resultType.onlyCorrect',
                                  { fallback: 'Only correct answers' }
                                )}
                              </SelectItem>
                              <SelectItem
                                value={AssignmentResultType.ALL_ANSWERS}
                              >
                                {t(
                                  'instructor.assignment.settings.resultType.allAnswers',
                                  { fallback: 'All answers' }
                                )}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <SubmitButton
                  isSubmitting={isSubmitting}
                  submitText={t('common.create', { fallback: 'Create' })}
                  loadingText={t('common.creating', {
                    fallback: 'Creating...',
                  })}
                  className="w-full"
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
