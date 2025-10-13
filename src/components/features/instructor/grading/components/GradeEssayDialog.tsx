'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollableDialogContent } from '@/components/shared/ui/ScrollableDialogContent';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sanitizeHtml } from '@/lib/sanitize';

import { useGradeEssay } from '../hooks/useGrading';
import { GradeEssayFormData, gradeEssaySchema } from '../schemas/gradingSchema';
import { EssayAnswer } from '../types/grading';

interface GradeEssayDialogProps {
  answer: EssayAnswer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GradeEssayDialog({
  answer,
  open,
  onOpenChange,
}: GradeEssayDialogProps) {
  const t = useTranslations();
  const gradeEssay = useGradeEssay();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GradeEssayFormData>({
    resolver: zodResolver(gradeEssaySchema),
    defaultValues: {
      score: answer.currentScore ?? 0,
      feedback: answer.currentFeedback ?? '',
    },
  });

  const onSubmit = async (data: GradeEssayFormData) => {
    setIsSubmitting(true);
    try {
      await gradeEssay.mutateAsync({
        answerId: answer.answerId,
        grading: data,
      });

      toast.success(
        t('instructor.grading.success', {
          fallback: 'Graded successfully',
        }),
        {
          description: t('instructor.grading.successDescription', {
            fallback: 'The essay has been graded.',
          }),
        }
      );

      onOpenChange(false);
    } catch {
      toast.error(
        t('instructor.grading.error', {
          fallback: 'Failed to grade essay',
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {t('instructor.grading.gradeEssay', { fallback: 'Grade Essay' })}
          </DialogTitle>
          <DialogDescription>
            {t('instructor.grading.student', { fallback: 'Student' })}:{' '}
            <span className="font-medium">{answer.studentName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-medium mb-2">
              {t('instructor.grading.question', { fallback: 'Question' })} (
              {answer.questionPoints}{' '}
              {t('common.points', { fallback: 'points' })})
            </h4>
            <div
              className="text-sm"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(answer.questionText),
              }}
            />
          </div>

          {/* Grading Criteria */}
          {answer.gradingCriteria && (
            <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/30">
              <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                {t('instructor.grading.gradingCriteria', {
                  fallback: 'Grading Criteria',
                })}
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                {answer.gradingCriteria}
              </div>
            </div>
          )}

          {/* Student Answer */}
          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-2">
              {t('instructor.grading.studentAnswer', {
                fallback: 'Student Answer',
              })}
            </h4>
            <div className="text-sm whitespace-pre-wrap">
              {answer.studentAnswer || (
                <span className="text-muted-foreground italic">
                  {t('instructor.grading.noAnswer', {
                    fallback: 'No answer provided',
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Grading Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('instructor.grading.score', { fallback: 'Score' })} (0-
                      {answer.questionPoints})
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={answer.questionPoints}
                        step={0.5}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('instructor.grading.feedback', {
                        fallback: 'Feedback (Optional)',
                      })}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder={t(
                          'instructor.grading.feedbackPlaceholder',
                          {
                            fallback: 'Provide feedback to the student...',
                          }
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  {t('common.cancel', { fallback: 'Cancel' })}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isSubmitting
                    ? t('instructor.grading.grading', {
                        fallback: 'Grading...',
                      })
                    : t('instructor.grading.submitGrade', {
                        fallback: 'Submit Grade',
                      })}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </ScrollableDialogContent>
    </Dialog>
  );
}
