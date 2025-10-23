'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronLeft, ChevronRight, Save, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAttemptContent } from '@/features/student/attempt/hooks/useAttemptContent';
import { useSaveAttemptState } from '@/features/student/attempt/hooks/useSaveAttemptState';
import { useCompleteAttempt } from '@/features/student/attempt/hooks/useCompleteAttempt';
import { AttemptFullData } from '@/features/student/history/schemas/attemptSchema';
import { cn } from '@/lib/utils';

type AnswerValue = number[]; // Array of selected answer IDs for multiple choice

interface AttemptPlayerClientProps {
  attemptId: number;
}

function buildSavePayload(
  content: AttemptFullData,
  values: Record<number, AnswerValue>
) {
  const answers = Object.entries(values).map(([questionId, v]) => {
    const qid = Number(questionId);
    return { questionId: qid, answerIds: v } as const;
  });
  return { attemptId: content.attemptId, answers };
}

export default function AttemptPlayerClient({ attemptId }: AttemptPlayerClientProps) {
  const t = useTranslations();
  const { data: content, isLoading, isError } = useAttemptContent(attemptId);
  const saveMutation = useSaveAttemptState();
  const completeMutation = useCompleteAttempt();

  const [values, setValues] = useState<Record<number, AnswerValue>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  // Calculate progress
  const answeredCount = useMemo(() => {
    if (!content) return 0;
    return Object.keys(values).filter(key => {
      const val = values[Number(key)];
      return Array.isArray(val) && val.length > 0;
    }).length;
  }, [values, content]);

  const progressPercentage = useMemo(() => {
    if (!content || content.questions.length === 0) return 0;
    return (answeredCount / content.questions.length) * 100;
  }, [answeredCount, content]);

  const currentQuestion = useMemo(() => {
    if (!content || !content.questions[currentQuestionIndex]) return null;
    return content.questions[currentQuestionIndex];
  }, [content, currentQuestionIndex]);

  const canGoNext = currentQuestionIndex < (content?.questions.length || 0) - 1;
  const canGoPrev = currentQuestionIndex > 0;

  const handleNext = () => {
    if (canGoNext) setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (canGoPrev) setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-pulse text-muted-foreground">
            {t('common.loading', { fallback: 'Loading…' })}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !content) {
    return (
      <Card className="border-destructive">
        <CardHeader className="text-destructive">
          {t('common.error', { fallback: 'Error loading attempt' })}
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {content.title || t('student.attempt.title', { fallback: 'Quiz Attempt' })}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('student.attempt.progress', { 
                    answered: answeredCount, 
                    total: content.questions.length,
                    fallback: `${answeredCount} of ${content.questions.length} answered`
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSaveNow} 
                  disabled={saveMutation.isPending || !content}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {t('common.save', { fallback: 'Save' })}
                </Button>
                <Button 
                  size="sm"
                  onClick={handleComplete} 
                  disabled={completeMutation.isPending}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t('student.attempt.complete', { fallback: 'Complete' })}
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t('student.attempt.overallProgress', { fallback: 'Overall Progress' })}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Question Navigation Pills */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground mr-2">
              {t('student.attempt.questions', { fallback: 'Questions:' })}
            </span>
            {content.questions.map((q, idx) => {
              const isAnswered = Array.isArray(values[q.id]) && (values[q.id]?.length ?? 0) > 0;
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => handleQuestionSelect(idx)}
                  className={cn(
                    "w-10 h-10 rounded-full text-sm font-medium transition-all",
                    isCurrent && "ring-2 ring-primary ring-offset-2",
                    isAnswered 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {isAnswered && <Check className="h-4 w-4 mx-auto" />}
                  {!isAnswered && idx + 1}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {t('student.attempt.questionNumber', { 
                  number: currentQuestionIndex + 1, 
                  total: content.questions.length,
                  fallback: `Question ${currentQuestionIndex + 1} of ${content.questions.length}`
                })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Text */}
            <div className="text-lg font-medium leading-relaxed">
              {currentQuestion.content}
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.answers?.map((ans) => {
                const selected = Array.isArray(values[currentQuestion.id])
                  ? (values[currentQuestion.id] as number[]).includes(ans.id)
                  : false;
                
                return (
                  <label
                    key={ans.id}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      "hover:bg-accent hover:border-accent-foreground/20",
                      selected 
                        ? "border-primary bg-primary/5" 
                        : "border-border"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleChoice(currentQuestion.id, ans.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="flex-1 text-base">{ans.content}</span>
                    {selected && (
                      <Check className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={!canGoPrev}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {t('student.attempt.previous', { fallback: 'Previous' })}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} / {content.questions.length}
              </div>

              <Button
                onClick={handleNext}
                disabled={!canGoNext}
                className="gap-2"
              >
                {t('student.attempt.next', { fallback: 'Next' })}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
