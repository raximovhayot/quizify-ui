'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAttemptContent } from '@/features/student/attempt/hooks/useAttemptContent';
import { useSaveAttemptState } from '@/features/student/attempt/hooks/useSaveAttemptState';
import { useCompleteAttempt } from '@/features/student/attempt/hooks/useCompleteAttempt';
import { QuestionType } from '@/features/instructor/quiz/types/question';
import { AttemptFullData } from '@/features/student/history/schemas/attemptSchema';

type AnswerValue = number[] | string; // number[] for selection-based; string for text/boolean

interface AttemptPlayerClientProps {
  attemptId: number;
}

function buildSavePayload(
  content: AttemptFullData,
  values: Record<number, AnswerValue>
) {
  const answers = Object.entries(values).map(([questionId, v]) => {
    const qid = Number(questionId);
    if (Array.isArray(v)) {
      return { questionId: qid, answerIds: v } as const;
    }
    return { questionId: qid, textAnswer: v } as const;
  });
  return { attemptId: content.attemptId, answers };
}

export default function AttemptPlayerClient({ attemptId }: AttemptPlayerClientProps) {
  const t = useTranslations();
  const { data: content, isLoading, isError } = useAttemptContent(attemptId);
  const saveMutation = useSaveAttemptState();
  const completeMutation = useCompleteAttempt();

  const [values, setValues] = useState<Record<number, AnswerValue>>({});

  // Initialize local state from content when first loaded
  useEffect(() => {
    if (!content) return;
    // If backend provides current state, we could hydrate here. For now, keep empty.
  }, [content]);

  // Debounced autosave
  useEffect(() => {
    if (!content) return;
    const timer = setTimeout(() => {
      const payload = buildSavePayload(content, values);
      if (payload.answers.length > 0) {
        saveMutation.mutate(payload);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [content, values, saveMutation]);

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
    if (content) {
      const payload = buildSavePayload(content, values);
      if (payload.answers.length > 0) {
        saveMutation.mutate(payload);
      }
    }
  }, [content, values, saveMutation]);

  const handleComplete = useCallback(() => {
    completeMutation.mutate({ attemptId });
  }, [completeMutation, attemptId]);

  const header = useMemo(() => {
    return (
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold truncate">
          {content?.title || t('student.attempt.title', { fallback: 'Attempt' })}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleSaveNow} disabled={saveMutation.isPending || !content}>
            {t('common.save', { fallback: 'Save' })}
          </Button>
          <Button onClick={handleComplete} disabled={completeMutation.isPending}>
            {t('student.attempt.complete', { fallback: 'Complete' })}
          </Button>
        </div>
      </div>
    );
  }, [content, saveMutation.isPending, completeMutation.isPending, t, handleSaveNow, handleComplete]);

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
    <Card>
      <CardHeader>{header}</CardHeader>
      <CardContent>
        <ol className="space-y-6">
          {content.questions.map((q, idx) => (
            <li key={q.id} className="border rounded-md p-4">
              <div className="font-medium mb-3">
                <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                {q.content}
              </div>
              <ul className="space-y-2">
                {q.answers?.map((ans) => {
                  const selected = Array.isArray(values[q.id])
                    ? (values[q.id] as number[]).includes(ans.id)
                    : false;
                  return (
                    <li key={ans.id}>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => onToggleChoice(q.id, ans.id)}
                        />
                        <span>{ans.content}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
