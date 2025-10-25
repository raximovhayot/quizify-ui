'use client';

import { Calendar, Clock, RefreshCw, Shuffle } from 'lucide-react';
import { format } from 'date-fns';

import { useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { AssignmentDTO } from '../types/assignment';

interface AssignmentViewConfigurationProps {
  assignment: AssignmentDTO;
}

export function AssignmentViewConfiguration({
  assignment,
}: Readonly<AssignmentViewConfigurationProps>) {
  const t = useTranslations();

  const settings = assignment.settings;

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'PPp');
    } catch {
      return dateString;
    }
  };

  const formatTimeLimit = (minutes?: number) => {
    if (!minutes || minutes === 0)
      return t('instructor.assignment.settings.unlimited', {
        fallback: 'Unlimited',
      });
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  const formatAttempts = (attempts?: number) => {
    if (!attempts || attempts === 0)
      return t('instructor.assignment.settings.unlimited', {
        fallback: 'Unlimited',
      });
    return attempts.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('instructor.assignment.settings.title', { fallback: 'Settings' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {settings && (
          <>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {t('instructor.assignment.settings.startTime', {
                    fallback: 'Start Time',
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(settings.startTime)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {t('instructor.assignment.settings.endTime', {
                    fallback: 'End Time',
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(settings.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {t('instructor.assignment.settings.timeLimit', {
                    fallback: 'Time Limit',
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTimeLimit(settings.time)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RefreshCw className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {t('instructor.assignment.settings.maxAttempts', {
                    fallback: 'Max Attempts',
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatAttempts(settings.attempt)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shuffle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {t('instructor.assignment.settings.shuffle', {
                    fallback: 'Shuffle',
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {settings.shuffleQuestions && settings.shuffleAnswers
                    ? t('instructor.assignment.settings.shuffleBoth', {
                        fallback: 'Questions & Answers',
                      })
                    : settings.shuffleQuestions
                      ? t('instructor.assignment.settings.shuffleQuestions', {
                          fallback: 'Questions only',
                        })
                      : settings.shuffleAnswers
                        ? t('instructor.assignment.settings.shuffleAnswers', {
                            fallback: 'Answers only',
                          })
                        : t('instructor.assignment.settings.shuffleNone', {
                            fallback: 'None',
                          })}
                </p>
              </div>
            </div>
          </>
        )}

        {!settings && (
          <p className="text-sm text-muted-foreground">
            {t('instructor.assignment.settings.noSettings', {
              fallback: 'No settings configured',
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
