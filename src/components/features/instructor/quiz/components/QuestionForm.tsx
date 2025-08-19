'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { AttachmentService } from '@/components/features/attachment/attachmentService';
import type { AttachmentDTO } from '@/components/features/attachment/attachmentService';
import { AttachmentDisplay } from '@/components/shared/ui/AttachmentDisplay';
import { FileUpload } from '@/components/shared/ui/FileUpload';
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
import { QuestionType } from '../types/question';
import { AnswerListEditor } from './answers/AnswerListEditor';

export interface QuestionFormProps {
  quizId: number;
  onSubmit: (data: TInstructorQuestionForm) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function QuestionForm({
  quizId,
  onSubmit,
  onCancel,
  isSubmitting,
}: QuestionFormProps) {
  const t = useTranslations();
  const { data: session } = useSession();

  const form = useForm<TInstructorQuestionForm>({
    resolver: zodResolver(instructorQuestionFormSchema),
    defaultValues: {
      quizId,
      questionType: QuestionType.MULTIPLE_CHOICE,
      content: '',
      explanation: '',
      order: 0,
      points: 1,
      answers: [{ content: '', correct: true, order: 0 }],
    } as unknown as TInstructorQuestionForm,
  });

  const type = form.watch('questionType');

  // Attachment handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentAttachment, setCurrentAttachment] =
    useState<AttachmentDTO | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileSelect(file: File) {
    if (!session?.accessToken) return;
    setSelectedFile(file);
    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((p) =>
          p >= 90 ? (clearInterval(progressInterval), p) : p + 10
        );
      }, 200);
      const attachment = await AttachmentService.uploadAttachment(
        file,
        session.accessToken
      );
      clearInterval(progressInterval);
      setUploadProgress(100);
      form.setValue('attachmentId', attachment.id);
      setCurrentAttachment(attachment);
      setSelectedFile(null);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }
  function handleFileRemove() {
    setSelectedFile(null);
    setUploadError(null);
  }
  async function handleAttachmentDelete(attachmentId: number) {
    if (!session?.accessToken) return;
    await AttachmentService.deleteAttachment(attachmentId, session.accessToken);
    setCurrentAttachment(null);
    form.setValue('attachmentId', undefined);
  }

  const submit = async (data: TInstructorQuestionForm) => {
    await onSubmit(data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="questionType">
              {t('instructor.quiz.question.type', {
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
                      {t('student.quiz.types.multipleChoice', {
                        fallback: 'Multiple choice',
                      })}
                    </SelectItem>
                    <SelectItem value={QuestionType.TRUE_FALSE}>
                      {t('student.quiz.types.trueFalse', {
                        fallback: 'True/False',
                      })}
                    </SelectItem>
                    <SelectItem value={QuestionType.SHORT_ANSWER}>
                      {t('student.quiz.types.shortAnswer', {
                        fallback: 'Short answer',
                      })}
                    </SelectItem>
                    <SelectItem value={QuestionType.FILL_IN_BLANK}>
                      {t('student.quiz.types.fillInBlank', {
                        fallback: 'Fill in the blank',
                      })}
                    </SelectItem>
                    <SelectItem value={QuestionType.ESSAY}>
                      {t('student.quiz.types.essay', { fallback: 'Essay' })}
                    </SelectItem>
                    <SelectItem value={QuestionType.MATCHING}>
                      {t('student.quiz.types.matching', {
                        fallback: 'Matching',
                      })}
                    </SelectItem>
                    <SelectItem value={QuestionType.RANKING}>
                      {t('student.quiz.types.ranking', { fallback: 'Ranking' })}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label htmlFor="points">
              {t('instructor.quiz.question.points', { fallback: 'Points' })}
            </Label>
            <Input
              id="points"
              type="number"
              min={0}
              {...form.register('points', { valueAsNumber: true })}
            />
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

        {/* Conditional sections */}
        {type === QuestionType.MULTIPLE_CHOICE && (
          <div className="space-y-2">
            <Label>
              {t('instructor.quiz.question.answers', { fallback: 'Answers' })}
            </Label>
            <AnswerListEditor />
          </div>
        )}
        {type === QuestionType.SHORT_ANSWER && (
          <div className="space-y-2">
            <Label>
              {t('instructor.quiz.question.answers', { fallback: 'Answers' })}
            </Label>
            <AnswerListEditor enforceCorrect />
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

        {/* Attachment */}
        <div className="space-y-2">
          <Label>{t('quiz.form.attachment', { fallback: 'Attachment' })}</Label>
          {currentAttachment ? (
            <AttachmentDisplay
              attachment={currentAttachment}
              onDownload={(a) => window.open(a.downloadUrl, '_blank')}
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
        </div>

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
          <Button type="submit" disabled={isSubmitting || isUploading}>
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
  const { register, watch, setValue } = useFormContext<TMatchingForm>();
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
      </div>
    </div>
  );
}

function RankingEditor() {
  const t = useTranslations();
  type TRankingForm = TInstructorQuestionForm & { rankingItems: string[] };
  const { register, watch, setValue } = useFormContext<TRankingForm>();
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
      </div>
    </div>
  );
}
