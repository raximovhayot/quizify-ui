'use client';

import { memo } from 'react';
import { Clock, RotateCcw, Settings, Shuffle } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { QuizDataDTO } from '../types/quiz';

export interface QuizViewConfigurationProps {
  quiz: QuizDataDTO;
}

export const QuizViewConfiguration = memo(function QuizViewConfiguration({ quiz }: QuizViewConfigurationProps) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" />
          {t('instructor.quiz.view.configuration.title', {
            fallback: 'Settings',
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {t('instructor.quiz.form.timeLimit', {
                  fallback: 'Time Limit',
                })}
              </span>
            </div>
            <Badge variant="outline" className="text-xs font-medium">
              {formatTimeLimit(quiz.settings.time)}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {t('instructor.quiz.form.maxAttempts', {
                  fallback: 'Max Attempts',
                })}
              </span>
            </div>
            <Badge variant="outline" className="text-xs font-medium">
              {formatAttempts(quiz.settings.attempt)}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Shuffle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {t('instructor.quiz.form.shuffleQuestions', {
                  fallback: 'Shuffle Questions',
                })}
              </span>
            </div>
            <Badge
              variant={quiz.settings.shuffleQuestions ? 'default' : 'secondary'}
              className="text-xs font-medium"
            >
              {quiz.settings.shuffleQuestions
                ? t('common.yes', { fallback: 'Yes' })
                : t('common.no', { fallback: 'No' })}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Shuffle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {t('instructor.quiz.form.shuffleAnswers', {
                  fallback: 'Shuffle Answers',
                })}
              </span>
            </div>
            <Badge
              variant={quiz.settings.shuffleAnswers ? 'default' : 'secondary'}
              className="text-xs font-medium"
            >
              {quiz.settings.shuffleAnswers
                ? t('common.yes', { fallback: 'Yes' })
                : t('common.no', { fallback: 'No' })}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
