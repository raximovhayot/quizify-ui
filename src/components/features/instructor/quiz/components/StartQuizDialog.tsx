'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { useCreateAssignment } from '../../analytics/hooks/useCreateAssignment';
import {
  AssignmentResultShowType,
  AssignmentResultType,
} from '../../analytics/types/assignment';

// Simplified schema for quick assignment creation
const quickAssignmentSchema = z.object({
  title: z.string().trim().min(3).max(512),
  description: z.string().trim().max(1024).optional(),
  startTime: z.string(),
  endTime: z.string(),
});

type TQuickAssignmentForm = z.infer<typeof quickAssignmentSchema>;

export interface StartQuizDialogProps {
  quizId: number;
  quizTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartQuizDialog({
  quizId,
  quizTitle,
  open,
  onOpenChange,
}: StartQuizDialogProps) {
  const t = useTranslations();
  const createAssignment = useCreateAssignment();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default times: now and 1 hour from now
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TQuickAssignmentForm>({
    resolver: zodResolver(quickAssignmentSchema),
    defaultValues: {
      title: `${quizTitle} - Assignment`,
      description: '',
      startTime: now.toISOString().slice(0, 16), // Format for datetime-local input
      endTime: oneHourLater.toISOString().slice(0, 16),
    },
  });

  const onSubmit = async (data: TQuickAssignmentForm) => {
    setIsSubmitting(true);
    try {
      await createAssignment.mutateAsync({
        quizId,
        title: data.title,
        description: data.description,
        settings: {
          startTime: new Date(data.startTime).toISOString(),
          endTime: new Date(data.endTime).toISOString(),
          attempt: 0, // unlimited
          time: 0, // unlimited
          shuffleQuestions: false,
          shuffleAnswers: false,
          resultShowType: AssignmentResultShowType.AFTER_ASSIGNMENT,
          resultType: AssignmentResultType.ONLY_CORRECT,
        },
      });
      reset();
      onOpenChange(false);
    } catch (_error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {t('instructor.assignment.create.title', {
              fallback: 'Start Quiz',
            })}
          </DialogTitle>
          <DialogDescription>
            {t('instructor.assignment.create.description', {
              fallback:
                'Create an assignment to start the quiz for your students.',
            })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              {t('instructor.assignment.create.titleLabel', {
                fallback: 'Assignment Title',
              })}
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder={t('instructor.assignment.create.titlePlaceholder', {
                fallback: 'Enter assignment title',
              })}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {t('instructor.assignment.create.descriptionLabel', {
                fallback: 'Description (optional)',
              })}
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t(
                'instructor.assignment.create.descriptionPlaceholder',
                {
                  fallback: 'Enter assignment description',
                }
              )}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">
                {t('instructor.assignment.create.startTimeLabel', {
                  fallback: 'Start Time',
                })}
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...register('startTime')}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">
                {t('instructor.assignment.create.endTimeLabel', {
                  fallback: 'End Time',
                })}
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...register('endTime')}
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel', { fallback: 'Cancel' })}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t('common.creating', { fallback: 'Creating...' })
                : t('instructor.assignment.create.submit', {
                    fallback: 'Create Assignment',
                  })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
