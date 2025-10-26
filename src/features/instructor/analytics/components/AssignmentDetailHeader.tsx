'use client';

import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Edit,
  Play,
  RefreshCw,
  Shuffle,
  StopCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';

import { AssignmentDTO, AssignmentStatus } from '../types/assignment';

interface AssignmentDetailHeaderProps {
  assignment: AssignmentDTO;
}

export function AssignmentDetailHeader({
  assignment,
}: Readonly<AssignmentDetailHeaderProps>) {
  const t = useTranslations();
  const router = useRouter();
  const [codeCopied, setCodeCopied] = useState(false);

  const settings = assignment.settings;

  const getStatusBadge = (status?: AssignmentStatus | string) => {
    switch (status) {
      case AssignmentStatus.STARTED:
        return (
          <Badge variant="default" className="bg-green-600">
            {t('common.status.active', { fallback: 'Active' })}
          </Badge>
        );
      case AssignmentStatus.FINISHED:
        return (
          <Badge variant="secondary">
            {t('common.status.finished', { fallback: 'Finished' })}
          </Badge>
        );
      case AssignmentStatus.CREATED:
      default:
        return (
          <Badge variant="outline">
            {t('common.status.draft', { fallback: 'Draft' })}
          </Badge>
        );
    }
  };

  const handleCopyCode = () => {
    if (assignment.code) {
      navigator.clipboard.writeText(assignment.code);
      setCodeCopied(true);
      toast.success(t('common.copied', { fallback: 'Copied to clipboard' }));
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleEdit = () => {
    // Navigate to edit page
    router.push(`/instructor/assignments/${assignment.id}/edit`);
  };

  const handleStartNow = () => {
    // TODO: Implement start immediately
    toast.info(t('common.comingSoon', { fallback: 'Coming soon' }));
  };

  const handleEndNow = () => {
    // TODO: Implement end immediately
    toast.info(t('common.comingSoon', { fallback: 'Coming soon' }));
  };

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

  const isStarted = assignment.status === AssignmentStatus.STARTED;
  const isFinished = assignment.status === AssignmentStatus.FINISHED;

  return (
    <div className="space-y-4">

      {/* Main header card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {assignment.title}
                </h1>
                {getStatusBadge(assignment.status)}
              </div>
              {assignment.description && (
                <p className="text-muted-foreground">{assignment.description}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                {t('common.edit', { fallback: 'Edit' })}
              </Button>
              {!isStarted && !isFinished && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleStartNow}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {t('common.startNow', { fallback: 'Start Now' })}
                </Button>
              )}
              {isStarted && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndNow}
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  {t('common.endNow', { fallback: 'End Now' })}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Assignment Code */}
            {assignment.code && (
              <div className="col-span-full">
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {t('common.accessCode', { fallback: 'Access Code' })}
                        </p>
                        <p className="text-3xl font-bold tracking-wider font-mono">
                          {assignment.code}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleCopyCode}
                        className="gap-2"
                      >
                        {codeCopied ? (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            {t('common.copied', { fallback: 'Copied!' })}
                          </>
                        ) : (
                          <>
                            <Copy className="h-5 w-5" />
                            {t('common.copy', { fallback: 'Copy' })}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Grid */}
            {settings && (
              <>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {t('common.startTime', { fallback: 'Start Time' })}
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
                      {t('common.endTime', { fallback: 'End Time' })}
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
                      {t('common.timeLimit', { fallback: 'Time Limit' })}
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
                      {t('common.maxAttempts', { fallback: 'Max Attempts' })}
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
                      {t('common.shuffle', { fallback: 'Shuffle' })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {settings.shuffleQuestions && settings.shuffleAnswers
                        ? t('common.questionsAndAnswers', {
                            fallback: 'Questions & Answers',
                          })
                        : settings.shuffleQuestions
                          ? t('common.questionsOnly', {
                              fallback: 'Questions only',
                            })
                          : settings.shuffleAnswers
                            ? t('common.answersOnly', {
                                fallback: 'Answers only',
                              })
                            : t('common.none', { fallback: 'None' })}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
