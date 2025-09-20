'use client';

import { useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';

import { QuestionForm } from '@/components/features/instructor/quiz/components/QuestionForm';
import { QuizListSkeleton } from '@/components/features/instructor/quiz/components/QuizListSkeleton';
import { useCreateQuestion } from '@/components/features/instructor/quiz/hooks/useQuestions';
import {
  useQuiz,
  useUpdateQuiz,
} from '@/components/features/instructor/quiz/hooks/useQuizzes';
import { toInstructorQuestionSaveRequest } from '@/components/features/instructor/quiz/schemas/questionSchema';
import { InstructorQuizUpdateRequest } from '@/components/features/instructor/quiz/types/quiz';
import { ErrorDisplay } from '@/components/shared/ui/ErrorDisplay';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function EditQuizPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams<{ quizId: string }>();
  const quizId = Number(params?.quizId ?? NaN);

  const { data: quiz, isLoading, isFetching, error, refetch } = useQuiz(quizId);
  const updateQuizMutation = useUpdateQuiz();

  // Local state for inline details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<string>('');

  // Settings modal state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState(() => ({
    time: 0,
    attempt: 0,
    shuffleQuestions: false,
    shuffleAnswers: false,
  }));

  // Add Question modal state
  const [questionOpen, setQuestionOpen] = useState(false);

  const createQuestionMutation = useCreateQuestion();

  useEffect(() => {
    if (!quiz) return;
    setTitle(quiz.title || '');
    setDescription(quiz.description || '');
    setSettingsDraft({
      time: quiz.settings?.time ?? 0,
      attempt: quiz.settings?.attempt ?? 0,
      shuffleQuestions: !!quiz.settings?.shuffleQuestions,
      shuffleAnswers: !!quiz.settings?.shuffleAnswers,
    });
  }, [quiz]);

  const isSaving = updateQuizMutation.isPending;
  const isBusy = isLoading || (isFetching && !quiz);

  const handleSaveDetails = async () => {
    if (!quiz) return;
    const payload: InstructorQuizUpdateRequest = {
      id: quiz.id,
      title: title?.trim() || quiz.title,
      description: description?.trim() || '',
      settings: quiz.settings, // unchanged here
      attachmentId: quiz.attachmentId,
    };
    try {
      await updateQuizMutation.mutateAsync(payload);
    } catch (e) {
      // handled by hook toasts
      console.error(e);
    }
  };

  const handleSaveSettings = async () => {
    if (!quiz) return;
    const payload: InstructorQuizUpdateRequest = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description || '',
      settings: {
        time: settingsDraft.time ?? 0,
        attempt: settingsDraft.attempt ?? 0,
        shuffleQuestions: !!settingsDraft.shuffleQuestions,
        shuffleAnswers: !!settingsDraft.shuffleAnswers,
      },
      attachmentId: quiz.attachmentId,
    };
    try {
      await updateQuizMutation.mutateAsync(payload);
      setSettingsOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const headerTitle = useMemo(
    () => t('instructor.quiz.edit.title', { fallback: 'Edit Quiz' }),
    [t]
  );

  if (isBusy) {
    return <QuizListSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <ErrorDisplay
          error={error}
          onRetry={() => refetch()}
          title={t('instructor.quiz.detail.error.title', {
            fallback: 'Failed to load quiz',
          })}
          description={t('instructor.quiz.detail.error.description', {
            fallback: 'Please try again.',
          })}
        />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-muted-foreground">
          {t('instructor.quiz.detail.no.data', { fallback: 'Quiz not found.' })}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {headerTitle}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/instructor/quizzes/${quiz.id}`)}
          >
            {t('common.view', { fallback: 'View' })}
          </Button>
          <Button variant="secondary" onClick={() => setSettingsOpen(true)}>
            {t('instructor.quiz.action.settings', { fallback: 'Settings' })}
          </Button>
        </div>
      </div>

      {/* Inline details editor */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('instructor.quiz.details', { fallback: 'Quiz Details' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">
              {t('quiz.form.title', { fallback: 'Title' })} *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('quiz.form.titlePlaceholder', {
                fallback: 'Enter quiz title',
              })}
              disabled={isSaving}
            />
          </div>
          <div>
            <Label htmlFor="description">
              {t('quiz.form.description', { fallback: 'Description' })}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t('quiz.form.descriptionPlaceholder', {
                fallback: 'Enter quiz description (optional)',
              })}
              disabled={isSaving}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSaveDetails} disabled={isSaving}>
            {isSaving
              ? t('common.saving', { fallback: 'Saving...' })
              : t('common.save', { fallback: 'Save' })}
          </Button>
        </CardFooter>
      </Card>

      {/* Questions section (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('instructor.quiz.questions', { fallback: 'Questions' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('instructor.quiz.questions.stub', {
              fallback:
                'Questions management UI will appear here. You can add and edit questions.',
            })}
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={() => setQuestionOpen(true)}>
            {t('instructor.quiz.question.add', { fallback: 'Add Question' })}
          </Button>
        </CardFooter>
      </Card>

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('instructor.quiz.settings.title', {
                fallback: 'Quiz Settings',
              })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="time">
                {t('quiz.form.timeLimit', { fallback: 'Time Limit (minutes)' })}
              </Label>
              <Input
                id="time"
                type="number"
                min={0}
                value={settingsDraft.time}
                onChange={(e) =>
                  setSettingsDraft((s) => ({
                    ...s,
                    time: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="attempt">
                {t('quiz.form.attemptLimit', { fallback: 'Attempt Limit' })}
              </Label>
              <Input
                id="attempt"
                type="number"
                min={0}
                value={settingsDraft.attempt}
                onChange={(e) =>
                  setSettingsDraft((s) => ({
                    ...s,
                    attempt: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="shuffleQuestions" className="text-sm">
                {t('quiz.form.shuffleQuestions', {
                  fallback: 'Shuffle Questions',
                })}
              </Label>
              <Switch
                id="shuffleQuestions"
                checked={settingsDraft.shuffleQuestions}
                onCheckedChange={(checked) =>
                  setSettingsDraft((s) => ({
                    ...s,
                    shuffleQuestions: !!checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="shuffleAnswers" className="text-sm">
                {t('quiz.form.shuffleAnswers', { fallback: 'Shuffle Answers' })}
              </Label>
              <Switch
                id="shuffleAnswers"
                checked={settingsDraft.shuffleAnswers}
                onCheckedChange={(checked) =>
                  setSettingsDraft((s) => ({ ...s, shuffleAnswers: !!checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              {t('common.cancel', { fallback: 'Cancel' })}
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving
                ? t('common.saving', { fallback: 'Saving...' })
                : t('common.save', { fallback: 'Save' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Question Modal */}
      <Dialog open={questionOpen} onOpenChange={setQuestionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t('instructor.quiz.question.add.title', {
                fallback: 'Add Question',
              })}
            </DialogTitle>
          </DialogHeader>

          <QuestionForm
            quizId={quiz.id}
            isSubmitting={createQuestionMutation.isPending}
            onCancel={() => setQuestionOpen(false)}
            onSubmit={async (formData) => {
              try {
                const payload = toInstructorQuestionSaveRequest({
                  ...formData,
                  quizId: quiz.id,
                });
                await createQuestionMutation.mutateAsync(payload);
                setQuestionOpen(false);
              } catch (e) {
                // toast handled in hook
                console.error(e);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
