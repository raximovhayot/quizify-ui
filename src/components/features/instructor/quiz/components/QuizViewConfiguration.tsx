'use client';

import { Clock, RotateCcw, Shuffle } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';

import { QuizDataDTO } from '../types/quiz';

export interface QuizViewConfigurationProps {
  quiz: QuizDataDTO;
}

export function QuizViewConfiguration({ quiz }: QuizViewConfigurationProps) {
  const t = useTranslations();

  const formatTimeLimit = (minutes: number) => {
    if (minutes === 0) return t('common.unlimited', { fallback: 'Unlimited' });
    if (minutes < 60)
      return t('common.time.minutes', {
        fallback: '{count}m',
        count: minutes,
      });
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0)
      return t('common.time.hours', { fallback: '{count}h', count: hours });
    return t('common.time.hoursMinutes', {
      fallback: '{hours}h {minutes}m',
      hours,
      minutes: remainingMinutes,
    });
  };

  const formatAttempts = (attempts: number) => {
    if (attempts === 0) return t('common.unlimited', { fallback: 'Unlimited' });
    return t('common.attempts', {
      fallback: '{count} attempts',
      count: attempts,
    });
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
      <div className="flex shrink-0 items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-muted/50">
        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <span className="text-xs sm:text-sm font-medium">
          {t('instructor.quiz.form.timeLimit', {
            fallback: 'Time Limit (minutes)',
          })}
        </span>
        <Badge variant="outline" className="text-[10px] sm:text-xs">
          {formatTimeLimit(quiz.settings.time)}
        </Badge>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-muted/50">
        <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <span className="text-xs sm:text-sm font-medium">
          {t('instructor.quiz.form.maxAttempts', { fallback: 'Max Attempts' })}
        </span>
        <Badge variant="outline" className="text-[10px] sm:text-xs">
          {formatAttempts(quiz.settings.attempt)}
        </Badge>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-muted/50">
        <Shuffle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <span className="text-xs sm:text-sm font-medium">
          {t('instructor.quiz.form.shuffleQuestions', {
            fallback: 'Shuffle Questions',
          })}
        </span>
        <Badge
          variant={quiz.settings.shuffleQuestions ? 'default' : 'secondary'}
          className="text-[10px] sm:text-xs"
        >
          {quiz.settings.shuffleQuestions
            ? t('common.yes', { fallback: 'Yes' })
            : t('common.no', { fallback: 'No' })}
        </Badge>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-muted/50">
        <Shuffle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <span className="text-xs sm:text-sm font-medium">
          {t('instructor.quiz.form.shuffleAnswers', {
            fallback: 'Shuffle Answers',
          })}
        </span>
        <Badge
          variant={quiz.settings.shuffleAnswers ? 'default' : 'secondary'}
          className="text-[10px] sm:text-xs"
        >
          {quiz.settings.shuffleAnswers
            ? t('common.yes', { fallback: 'Yes' })
            : t('common.no', { fallback: 'No' })}
        </Badge>
      </div>
    </div>
  );
}
