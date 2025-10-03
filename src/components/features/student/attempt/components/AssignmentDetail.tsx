'use client';

import { useState } from 'react';

import { AlertCircle, Calendar, Clock, Play, Trophy } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useStartAttempt } from '../hooks/useAttempt';

interface AssignmentDetailProps {
  assignmentId: number;
  assignment: {
    id: number;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    maxAttempts: number;
    timeLimit?: number; // in minutes
    attemptsUsed: number;
  };
}

export function AssignmentDetail({
  assignmentId,
  assignment,
}: AssignmentDetailProps) {
  const t = useTranslations();
  const router = useRouter();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const startAttempt = useStartAttempt();

  const canStart = assignment.attemptsUsed < assignment.maxAttempts;
  const now = new Date();
  const startTime = new Date(assignment.startTime);
  const endTime = new Date(assignment.endTime);
  const isActive = now >= startTime && now <= endTime;
  const isUpcoming = now < startTime;
  const isExpired = now > endTime;

  const handleStartAttempt = async () => {
    const attempt = await startAttempt.mutateAsync(assignmentId);
    setShowStartDialog(false);
    // Navigate to attempt page
    router.push(
      `/student/assignments/${assignmentId}/attempts/${attempt.id}`
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{assignment.title}</CardTitle>
          {assignment.description && (
            <p className="text-muted-foreground mt-2">
              {assignment.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div>
            {isUpcoming && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Clock className="h-5 w-5" />
                <span className="font-medium">
                  {t('student.assignment.upcoming', {
                    fallback: 'Starts soon',
                  })}
                </span>
              </div>
            )}
            {isActive && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Play className="h-5 w-5" />
                <span className="font-medium">
                  {t('student.assignment.active', {
                    fallback: 'Active now',
                  })}
                </span>
              </div>
            )}
            {isExpired && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  {t('student.assignment.expired', {
                    fallback: 'Expired',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {t('student.assignment.startTime', {
                    fallback: 'Start Time',
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(assignment.startTime).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {t('student.assignment.endTime', {
                    fallback: 'End Time',
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(assignment.endTime).toLocaleString()}
                </p>
              </div>
            </div>

            {assignment.timeLimit && (
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {t('student.assignment.timeLimit', {
                      fallback: 'Time Limit',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {assignment.timeLimit}{' '}
                    {t('student.assignment.minutes', {
                      fallback: 'minutes',
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Trophy className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {t('student.assignment.attempts', {
                    fallback: 'Attempts',
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {assignment.attemptsUsed} /{' '}
                  {assignment.maxAttempts === 0
                    ? t('student.assignment.unlimited', {
                        fallback: 'Unlimited',
                      })
                    : assignment.maxAttempts}
                </p>
              </div>
            </div>
          </div>

          {/* Start button */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={() => setShowStartDialog(true)}
              disabled={!canStart || !isActive || startAttempt.isPending}
              className="min-w-48"
            >
              {startAttempt.isPending ? (
                t('common.loading', { fallback: 'Loading...' })
              ) : !isActive ? (
                isUpcoming ? (
                  t('student.assignment.notStarted', {
                    fallback: 'Not Started Yet',
                  })
                ) : (
                  t('student.assignment.ended', {
                    fallback: 'Assignment Ended',
                  })
                )
              ) : !canStart ? (
                t('student.assignment.noAttemptsLeft', {
                  fallback: 'No Attempts Left',
                })
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  {t('student.assignment.startAttempt', {
                    fallback: 'Start Attempt',
                  })}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Start confirmation dialog */}
      <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('student.assignment.confirmStart', {
                fallback: 'Start Attempt?',
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('student.assignment.confirmStartMessage', {
                fallback:
                  'Once you start, the timer will begin. Make sure you have enough time to complete the quiz.',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel', { fallback: 'Cancel' })}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleStartAttempt}>
              {t('student.assignment.confirmStartButton', {
                fallback: 'Yes, Start Now',
              })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AssignmentDetailSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-10 w-48" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
