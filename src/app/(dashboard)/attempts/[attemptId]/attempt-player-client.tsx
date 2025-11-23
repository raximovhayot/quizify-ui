'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAttemptContent } from '@/features/student/attempt/hooks/useAttemptContent';
import { useSaveAttemptState } from '@/features/student/attempt/hooks/useSaveAttemptState';
import { useCompleteAttempt } from '@/features/student/attempt/hooks/useCompleteAttempt';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { QuestionNavigation } from '@/components/quiz/QuestionNavigation';
import { SubmitConfirmationDialog } from '@/components/quiz/SubmitConfirmationDialog';
import { useWebSocket } from '@/lib/websocket/hooks';
import { cn } from '@/lib/utils';

type AnswerValue = number[]; // Array of selected answer IDs for multiple choice

interface AttemptPlayerClientProps {
  attemptId: number;
}

function buildSavePayload(
  attemptId: number,
  values: Record<number, AnswerValue>
) {
  const answers = Object.entries(values).map(([questionId, v]) => {
    const qid = Number(questionId);
    return { questionId: qid, answerIds: v } as const;
  });
  return { attemptId, answers };
}

export default function AttemptPlayerClient({ attemptId }: AttemptPlayerClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const { data: content, isLoading, isError } = useAttemptContent(attemptId);
  const saveMutation = useSaveAttemptState();
  const completeMutation = useCompleteAttempt();
  const { subscribe } = useWebSocket();

  const [values, setValues] = useState<Record<number, AnswerValue>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Initialize local state from content when first loaded
  useEffect(() => {
    if (!content) return;
    // If backend provides current state, we could hydrate here. For now, keep empty.
  }, [content]);

  // WebSocket integration for real-time notifications
  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      if (message.attemptId !== attemptId) return;

      if (message.action === 'STOP') {
        toast.error(message.message || 'Quiz has been stopped by instructor');
        handleAutoSubmit();
      } else if (message.action === 'WARNING') {
        toast.warning(message.message || 'Warning from instructor');
      }
    });

    return unsubscribe;
  }, [attemptId, subscribe, handleAutoSubmit]);

  // Debounced autosave
  useEffect(() => {
    if (!content || autoSubmitted) return;
    const timer = setTimeout(() => {
      const payload = buildSavePayload(attemptId, values);
      if (payload.answers.length > 0) {
        saveMutation.mutate(payload);
      }
    }, 2000); // 2 second debounce
    return () => clearTimeout(timer);
  }, [attemptId, values, saveMutation, autoSubmitted, content]);

  const onToggleChoice = (questionId: number, answerId: number) => {
    setValues((prev) => {
      const prevVal = prev[questionId];
      const next = Array.isArray(prevVal) ? [...prevVal] : [];
      const idx = next.indexOf(answerId);
      if (idx >= 0) next.splice(idx, 1);
      else next.push(answerId);
      return { ...prev, [questionId]: next };
    });
  };

  const handleSaveNow = useCallback(() => {
    const payload = buildSavePayload(attemptId, values);
    if (payload.answers.length > 0) {
      saveMutation.mutate(payload);
    }
  }, [attemptId, values, saveMutation]);

  const handleAutoSubmit = useCallback(() => {
    if (autoSubmitted) return;
    setAutoSubmitted(true);
    completeMutation.mutate({ attemptId }, {
      onSuccess: () => {
        toast.success('Quiz submitted successfully');
        router.push('/dashboard/history');
      },
    });
  }, [completeMutation, attemptId, autoSubmitted, router]);

  const handleTimeExpired = useCallback(() => {
    toast.info('Time expired! Submitting your quiz...');
    handleAutoSubmit();
  }, [handleAutoSubmit]);

  const handleSubmitClick = useCallback(() => {
    setShowSubmitDialog(true);
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    if (autoSubmitted) return;
    setAutoSubmitted(true);
    completeMutation.mutate({ attemptId }, {
      onSuccess: () => {
        toast.success('Quiz submitted successfully');
        router.push('/dashboard/history');
      },
      onError: () => {
        setAutoSubmitted(false);
      },
    });
  }, [completeMutation, attemptId, autoSubmitted, router]);

  const handleToggleFlag = useCallback((index: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Calculate answered questions
  const answeredQuestions = useMemo(() => {
    if (!content?.questions) return new Set<number>();
    const answered = new Set<number>();
    content.questions.forEach((q, idx) => {
      if (values[q.id]?.length > 0) {
        answered.add(idx);
      }
    });
    return answered;
  }, [content, values]);

  // Calculate end time from startedAt and timeLimitSeconds
  const endTime = useMemo(() => {
    if (!content?.startedAt || !content?.timeLimitSeconds) return null;
    const start = new Date(content.startedAt);
    const end = new Date(start.getTime() + content.timeLimitSeconds * 1000);
    return end;
  }, [content]);

  const header = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-lg font-semibold truncate">
          {content?.title || t('student.attempt.title', { fallback: 'Attempt' })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {endTime && (
            <QuizTimer endTime={endTime} onTimeExpired={handleTimeExpired} />
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {saveMutation.isPending && (
              <>
                <Save className="h-4 w-4 animate-pulse" />
                <span>Saving...</span>
              </>
            )}
            {saveMutation.isSuccess && !saveMutation.isPending && (
              <span className="text-green-600 dark:text-green-500">✓ Saved</span>
            )}
          </div>
          <Button 
            variant="secondary" 
            onClick={handleSaveNow} 
            disabled={saveMutation.isPending || !content || autoSubmitted}
          >
            {t('common.save', { fallback: 'Save' })}
          </Button>
          <Button 
            onClick={handleSubmitClick} 
            disabled={completeMutation.isPending || autoSubmitted}
          >
            {t('student.attempt.complete', { fallback: 'Submit Quiz' })}
          </Button>
        </div>
      </div>
    );
  }, [content, saveMutation.isPending, saveMutation.isSuccess, completeMutation.isPending, autoSubmitted, endTime, t, handleSaveNow, handleSubmitClick, handleTimeExpired]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>{t('common.loading', { fallback: 'Loading…' })}</CardHeader>
      </Card>
    );
  }

  if (isError || !content) {
    return (
      <Card>
        <CardHeader>{t('common.error', { fallback: 'Error loading attempt' })}</CardHeader>
      </Card>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-4 gap-6')}>
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>{header}</CardHeader>
          <CardContent>
            {/* Question list */}
            <div className="space-y-6">
              {content.questions.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <QuestionNavigation
                    question={q}
                    index={idx}
                    onToggleChoice={onToggleChoice}
                    values={values[q.id] ?? []}
                    flagged={flaggedQuestions.has(idx)}
                    onToggleFlag={() => handleToggleFlag(idx)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>{t('student.attempt.side.title', { fallback: 'Overview' })}</CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">{t('student.attempt.side.answered', { fallback: 'Answered' })}</div>
                <div className="text-lg font-medium">{answeredQuestions.size}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('student.attempt.side.flagged', { fallback: 'Flagged' })}</div>
                <div className="text-lg font-medium">{flaggedQuestions.size}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleSaveNow} disabled={saveMutation.isPending || autoSubmitted}>
                  {t('common.save', { fallback: 'Save' })}
                </Button>
                <Button onClick={handleSubmitClick} disabled={completeMutation.isPending || autoSubmitted}>
                  {t('student.attempt.complete', { fallback: 'Submit' })}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SubmitConfirmationDialog
        open={showSubmitDialog}
        onOpenChange={(open) => setShowSubmitDialog(open)}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
}
