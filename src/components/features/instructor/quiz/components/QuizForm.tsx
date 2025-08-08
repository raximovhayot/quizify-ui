'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { AttachmentDisplay } from '@/components/shared/ui/AttachmentDisplay';
import { FileUpload } from '@/components/shared/ui/FileUpload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { AttachmentService } from '../../../attachment/attachmentService';
import type { AttachmentDTO } from '../../../attachment/attachmentService';
import {
  FullQuizDataDTO,
  InstructorQuizCreateRequest,
  InstructorQuizUpdateRequest,
} from '../types/quiz';

// Form validation schema
const quizFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(512, 'Title must be less than 512 characters'),
  description: z
    .string()
    .max(1024, 'Description must be less than 1024 characters')
    .optional(),
  settings: z.object({
    time: z.number().min(0, 'Time limit cannot be negative').optional(),
    attempt: z.number().min(0, 'Attempt limit cannot be negative').optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleAnswers: z.boolean().optional(),
  }),
  attachmentId: z.number().optional(),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

export interface QuizFormProps {
  quiz?: FullQuizDataDTO;
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
}: QuizFormProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentAttachment, setCurrentAttachment] =
    useState<AttachmentDTO | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoadingAttachment, setIsLoadingAttachment] = useState(false);

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: quiz?.title || '',
      description: quiz?.description || '',
      settings: {
        time: quiz?.settings?.time || undefined,
        attempt: quiz?.settings?.attempt || undefined,
        shuffleQuestions: quiz?.settings?.shuffleQuestions || false,
        shuffleAnswers: quiz?.settings?.shuffleAnswers || false,
      },
      attachmentId: quiz?.attachmentId || undefined,
    },
  });

  // Load existing attachment if quiz has one
  useEffect(() => {
    const loadAttachment = async () => {
      if (quiz?.attachmentId && session?.accessToken) {
        setIsLoadingAttachment(true);
        try {
          const attachment = await AttachmentService.getAttachment(
            quiz.attachmentId,
            session.accessToken
          );
          setCurrentAttachment(attachment);
        } catch (error) {
          console.error('Failed to load attachment:', error);
        } finally {
          setIsLoadingAttachment(false);
        }
      }
    };

    loadAttachment();
  }, [quiz?.attachmentId, session?.accessToken]);

  const handleFileSelect = async (file: File) => {
    if (!session?.accessToken) return;

    setSelectedFile(file);
    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const attachment = await AttachmentService.uploadAttachment(
        file,
        session.accessToken
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update form with new attachment ID
      form.setValue('attachmentId', attachment.id);
      setCurrentAttachment(attachment);
      setSelectedFile(null);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Failed to upload file'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadError(null);
  };

  const handleAttachmentDelete = async (attachmentId: number) => {
    if (!session?.accessToken) return;

    try {
      await AttachmentService.deleteAttachment(
        attachmentId,
        session.accessToken
      );
      setCurrentAttachment(null);
      form.setValue('attachmentId', undefined);
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  };

  const handleAttachmentDownload = (attachment: AttachmentDTO) => {
    window.open(attachment.downloadUrl, '_blank');
  };

  const handleFormSubmit = async (data: QuizFormValues) => {
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
            ? t('quiz.form.editTitle', { fallback: 'Edit Quiz' })
            : t('quiz.form.createTitle', { fallback: 'Create New Quiz' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">
                {t('quiz.form.title', { fallback: 'Title' })} *
              </Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder={t('quiz.form.titlePlaceholder', {
                  fallback: 'Enter quiz title',
                })}
                disabled={isSubmitting}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">
                {t('quiz.form.description', { fallback: 'Description' })}
              </Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder={t('quiz.form.descriptionPlaceholder', {
                  fallback: 'Enter quiz description (optional)',
                })}
                rows={3}
                disabled={isSubmitting}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Quiz Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t('quiz.form.settings', { fallback: 'Quiz Settings' })}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time">
                  {t('quiz.form.timeLimit', {
                    fallback: 'Time Limit (minutes)',
                  })}
                </Label>
                <Input
                  id="time"
                  type="number"
                  min="0"
                  {...form.register('settings.time', { valueAsNumber: true })}
                  placeholder={t('quiz.form.timeLimitPlaceholder', {
                    fallback: 'No limit',
                  })}
                  disabled={isSubmitting}
                />
                {form.formState.errors.settings?.time && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.settings.time.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="attempt">
                  {t('quiz.form.attemptLimit', { fallback: 'Attempt Limit' })}
                </Label>
                <Input
                  id="attempt"
                  type="number"
                  min="0"
                  {...form.register('settings.attempt', {
                    valueAsNumber: true,
                  })}
                  placeholder={t('quiz.form.attemptLimitPlaceholder', {
                    fallback: 'Unlimited',
                  })}
                  disabled={isSubmitting}
                />
                {form.formState.errors.settings?.attempt && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.settings.attempt.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="shuffleQuestions">
                  {t('quiz.form.shuffleQuestions', {
                    fallback: 'Shuffle Questions',
                  })}
                </Label>
                <Switch
                  id="shuffleQuestions"
                  {...form.register('settings.shuffleQuestions')}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="shuffleAnswers">
                  {t('quiz.form.shuffleAnswers', {
                    fallback: 'Shuffle Answers',
                  })}
                </Label>
                <Switch
                  id="shuffleAnswers"
                  {...form.register('settings.shuffleAnswers')}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Attachment Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t('quiz.form.attachment', { fallback: 'Attachment' })}
            </h3>

            {currentAttachment ? (
              <AttachmentDisplay
                attachment={currentAttachment}
                onDownload={handleAttachmentDownload}
                onDelete={handleAttachmentDelete}
                showActions={!isSubmitting}
              />
            ) : (
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                selectedFile={selectedFile}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                error={uploadError ?? undefined}
                disabled={isSubmitting}
              />
            )}

            {isLoadingAttachment && (
              <Alert>
                <AlertDescription>
                  {t('quiz.form.loadingAttachment', {
                    fallback: 'Loading attachment...',
                  })}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
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
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting
                ? t('common.saving', { fallback: 'Saving...' })
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
