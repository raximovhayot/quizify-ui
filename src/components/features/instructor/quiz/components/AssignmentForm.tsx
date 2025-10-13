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
import { Label } from '@/components/ui/label';
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
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        {t('instructor.assignment.create.titleLabel', {
                          default: 'Assignment Title',
                        })}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-10 w-full"
                          placeholder={t(
                            'instructor.assignment.create.titlePlaceholder',
                            { default: 'Enter assignment title' }
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
                      <FormLabel className="text-sm">
                        {t('instructor.assignment.create.descriptionLabel', {
                          default: 'Description (optional)',
                        })}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder={t(
                            'instructor.assignment.create.descriptionPlaceholder',
                            { default: 'Enter assignment description' }
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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
                  <FormField
                    control={form.control}
                    name="startTimeLocal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          {t('instructor.assignment.create.startTimeLabel', {
                            default: 'Start Time',
                          })}
                        </FormLabel>
                        <FormControl>
                          <Input type="datetime-local" className="h-10 w-full" {...field} />
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
                        <FormLabel className="text-sm">
                          {t('instructor.assignment.create.endTimeLabel', {
                            default: 'End Time',
                          })}
                        </FormLabel>
                        <FormControl>
                          <Input type="datetime-local" className="h-10 w-full" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="attempt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          {t('instructor.assignment.settings.attempts', {
                            default: 'Max attempts (0 = unlimited)',
                          })}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step={1} className="h-10 w-full" {...field} />
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
                        <FormLabel className="text-sm">
                          {t('instructor.assignment.settings.timeLimit', {
                            default: 'Time limit (minutes, 0 = unlimited)',
                          })}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step={1} className="h-10 w-full" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3 md:col-span-2">
                    <FormField
                      control={form.control}
                      name="shuffleQuestions"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border px-3 py-3 min-h-12">
                          <div className="space-y-0.5 min-w-0">
                            <Label htmlFor="shuffleQuestions" className="text-sm">
                              {t(
                                'instructor.assignment.settings.shuffleQuestions',
                                { default: 'Shuffle questions' }
                              )}
                            </Label>
                          </div>
                          <FormControl>
                            <Switch
                              id="shuffleQuestions"
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
                        <FormItem className="flex items-center justify-between rounded-lg border px-3 py-3 min-h-12">
                          <div className="space-y-0.5 min-w-0">
                            <Label htmlFor="shuffleAnswers" className="text-sm">
                              {t(
                                'instructor.assignment.settings.shuffleAnswers',
                                { default: 'Shuffle answers' }
                              )}
                            </Label>
                          </div>
                          <FormControl>
                            <Switch
                              id="shuffleAnswers"
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
                        <FormLabel className="text-sm">
                          {t('instructor.assignment.settings.resultShowType.label', {
                            default: 'When to show results',
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
                                  { default: 'After assignment' }
                                )}
                              </SelectItem>
                              <SelectItem
                                value={
                                  AssignmentResultShowType.AFTER_EACH_ATTEMPT
                                }
                              >
                                {t(
                                  'instructor.assignment.settings.resultShowType.afterEachAttempt',
                                  { default: 'After each attempt' }
                                )}
                              </SelectItem>
                              <SelectItem
                                value={AssignmentResultShowType.NEVER}
                              >
                                {t(
                                  'instructor.assignment.settings.resultShowType.never',
                                  {
                                    default: 'Never',
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
                        <FormLabel className="text-sm">
                          {t('instructor.assignment.settings.resultType.label', {
                            default: 'Result details',
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
                                  { default: 'Only correct answers' }
                                )}
                              </SelectItem>
                              <SelectItem
                                value={AssignmentResultType.ALL_ANSWERS}
                              >
                                {t(
                                  'instructor.assignment.settings.resultType.allAnswers',
                                  { default: 'All answers' }
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
