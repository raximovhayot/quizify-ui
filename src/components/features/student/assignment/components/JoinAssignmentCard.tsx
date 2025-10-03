'use client';

import { useState } from 'react';

import { Calendar, Clock, Info, LogIn } from 'lucide-react';

import { useTranslations } from 'next-intl';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useCheckJoin, useJoinAssignment } from '../hooks/useRegistration';
import { CheckJoinResponse } from '../types/registration';

export function JoinAssignmentCard() {
  const t = useTranslations();
  const [code, setCode] = useState('');
  const [assignmentInfo, setAssignmentInfo] =
    useState<CheckJoinResponse | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const checkJoin = useCheckJoin();
  const joinAssignment = useJoinAssignment();

  const handleCheckCode = async () => {
    if (!code.trim()) {
      return;
    }

    const result = await checkJoin.mutateAsync({ code: code.trim() });
    setAssignmentInfo(result);
    setShowConfirmDialog(true);
  };

  const handleJoin = async () => {
    if (!code.trim()) return;
    await joinAssignment.mutateAsync({ code: code.trim() });
    setShowConfirmDialog(false);
    setCode('');
    setAssignmentInfo(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            {t('student.assignment.joinTitle', {
              fallback: 'Join Assignment',
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="join-code">
              {t('student.assignment.joinCodeLabel', {
                fallback: 'Assignment Code',
              })}
            </Label>
            <div className="flex gap-2">
              <Input
                id="join-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={t('student.assignment.joinCodePlaceholder', {
                  fallback: 'Enter code',
                })}
                className="uppercase font-mono"
                maxLength={20}
              />
              <Button
                onClick={handleCheckCode}
                disabled={!code.trim() || checkJoin.isPending}
              >
                {checkJoin.isPending
                  ? t('common.checking', { fallback: 'Checking...' })
                  : t('student.assignment.checkCode', {
                      fallback: 'Check',
                    })}
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              {t('student.assignment.joinHint', {
                fallback:
                  'Enter the code provided by your instructor to join an assignment.',
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {assignmentInfo?.isRegistered
                ? t('student.assignment.alreadyRegistered', {
                    fallback: 'Already Registered',
                  })
                : t('student.assignment.confirmJoin', {
                    fallback: 'Join Assignment?',
                  })}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p className="font-semibold text-foreground">
                  {assignmentInfo?.title}
                </p>

                {assignmentInfo?.description && (
                  <p className="text-sm">{assignmentInfo.description}</p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {t('student.assignment.startsAt', {
                        fallback: 'Starts:',
                      })}{' '}
                      {assignmentInfo?.startTime &&
                        new Date(assignmentInfo.startTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {t('student.assignment.endsAt', {
                        fallback: 'Ends:',
                      })}{' '}
                      {assignmentInfo?.endTime &&
                        new Date(assignmentInfo.endTime).toLocaleString()}
                    </span>
                  </div>
                </div>

                {assignmentInfo?.message && (
                  <p className="text-sm text-muted-foreground">
                    {assignmentInfo.message}
                  </p>
                )}

                {assignmentInfo?.isRegistered && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {t('student.assignment.alreadyRegisteredMessage', {
                      fallback:
                        'You are already registered for this assignment.',
                    })}
                  </p>
                )}

                {!assignmentInfo?.canJoin && !assignmentInfo?.isRegistered && (
                  <p className="text-sm text-destructive">
                    {t('student.assignment.cannotJoin', {
                      fallback: 'You cannot join this assignment at this time.',
                    })}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel', { fallback: 'Cancel' })}
            </AlertDialogCancel>
            {assignmentInfo?.isRegistered ? (
              <AlertDialogAction
                onClick={() => {
                  setShowConfirmDialog(false);
                  window.location.href = `/student/assignments/${assignmentInfo.assignmentId}`;
                }}
              >
                {t('student.assignment.viewAssignment', {
                  fallback: 'View Assignment',
                })}
              </AlertDialogAction>
            ) : assignmentInfo?.canJoin ? (
              <AlertDialogAction
                onClick={handleJoin}
                disabled={joinAssignment.isPending}
              >
                {joinAssignment.isPending
                  ? t('common.joining', { fallback: 'Joining...' })
                  : t('student.assignment.confirmJoinButton', {
                      fallback: 'Yes, Join',
                    })}
              </AlertDialogAction>
            ) : null}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
