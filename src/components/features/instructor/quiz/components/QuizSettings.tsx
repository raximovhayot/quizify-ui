'use client';

import { Clock, RotateCcw, Shuffle } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { QuizDataDTO } from '../types/quiz';

export interface QuizSettingsProps {
  quiz: QuizDataDTO;
}

export function QuizSettings({ quiz }: QuizSettingsProps) {
  const t = useTranslations();

  const formatBoolean = (value: boolean) => {
    return value
      ? t('instructor.quiz.settings.enabled', { fallback: 'Yes' })
      : t('instructor.quiz.settings.disabled', { fallback: 'No' });
  };

  const formatTimeLimit = (minutes: number) => {
    if (minutes === 0) {
      return t('instructor.quiz.time.unlimited', { fallback: 'Unlimited' });
    }
    if (minutes < 60) {
      return t('instructor.quiz.time.minutes', {
        fallback: '{minutes}m',
        minutes,
      });
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return t('instructor.quiz.time.hours', { fallback: '{hours}h', hours });
    }
    return t('instructor.quiz.time.hoursMinutes', {
      fallback: '{hours}h {minutes}m',
      hours,
      minutes: remainingMinutes,
    });
  };

  const formatAttempts = (attempts: number) => {
    if (attempts === 0) {
      return t('instructor.quiz.attempts.unlimited', { fallback: 'Unlimited' });
    }
    return t('instructor.quiz.attempts.count', {
      fallback: '{count} attempts',
      count: attempts,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {formatAttempts(quiz.settings.attempt)}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatTimeLimit(quiz.settings.time)}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <Shuffle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {formatBoolean(quiz.settings.shuffleQuestions)}
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <Shuffle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {formatBoolean(quiz.settings.shuffleAnswers)}
          </span>
        </div>
      </div>
    </div>
  );
}
