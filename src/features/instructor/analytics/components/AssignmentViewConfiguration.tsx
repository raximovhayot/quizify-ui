'use client';

import { Calendar, Clock, Copy, RotateCcw, Settings, Shuffle } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

import { AssignmentDTO } from '../types/assignment';

export interface AssignmentViewConfigurationProps {
  assignment: AssignmentDTO;
}

export function AssignmentViewConfiguration({ assignment }: Readonly<AssignmentViewConfigurationProps>) {
  const t = useTranslations();
  const [codeCopied, setCodeCopied] = useState(false);

  const settings = assignment.settings;

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return t('common.notSet', { fallback: 'Not set' });
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const formatTimeLimit = (minutes?: number) => {
    if (!minutes || minutes === 0)
      return t('common.unlimited', { fallback: 'Unlimited' });
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  const formatAttempts = (attempts?: number) => {
    if (!attempts || attempts === 0)
      return t('common.unlimited', { fallback: 'Unlimited' });
    return attempts.toString();
  };

  const handleCopyCode = () => {
    if (assignment.code) {
      navigator.clipboard.writeText(assignment.code);
      setCodeCopied(true);
      toast.success(t('common.copied', { fallback: 'Copied to clipboard' }));
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Access Code Card */}
      {assignment.code && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t('common.accessCode', { fallback: 'Access Code' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-2xl font-bold tracking-wider font-mono">
                  {assignment.code}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                {codeCopied ? t('common.copied', { fallback: 'Copied!' }) : t('common.copy', { fallback: 'Copy' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Card */}
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
            {settings && (
              <>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {t('common.startTime', { fallback: 'Start Time' })}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {formatDateTime(settings.startTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {t('common.endTime', { fallback: 'End Time' })}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {formatDateTime(settings.endTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {t('common.timeLimit', { fallback: 'Time Limit' })}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs font-medium">
                    {formatTimeLimit(settings.time)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {t('common.maxAttempts', { fallback: 'Max Attempts' })}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs font-medium">
                    {formatAttempts(settings.attempt)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shuffle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {t('common.shuffle', { fallback: 'Shuffle' })}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {settings.shuffleQuestions && settings.shuffleAnswers
                      ? t('common.questionsAndAnswers', {
                          fallback: 'Questions & Answers',
                        })
                      : settings.shuffleQuestions
                        ? t('common.questionsOnly', {
                            fallback: 'Questions',
                          })
                        : settings.shuffleAnswers
                          ? t('common.answersOnly', {
                              fallback: 'Answers',
                            })
                          : t('common.none', { fallback: 'None' })}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
