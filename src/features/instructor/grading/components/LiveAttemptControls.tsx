'use client';

import React, { useState } from 'react';
import { useAssignmentAttempts } from '@/lib/api/hooks/attempts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  StopCircle, 
  Users, 
  Clock,
  Send,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface LiveAttemptControlsProps {
  assignmentId: number;
  onSendStop?: (attemptId: number) => Promise<void>;
  onSendWarning?: (attemptId: number, message: string) => Promise<void>;
}

/**
 * LiveAttemptControls component for instructors to manage active quiz attempts
 * Features:
 * - View active attempts in real-time
 * - Send STOP command to force-submit
 * - Send WARNING messages to students
 * - Real-time attempt status updates
 * - Refresh functionality
 */
export function LiveAttemptControls({
  assignmentId,
  onSendStop,
  onSendWarning
}: LiveAttemptControlsProps) {
  const { data: response, isLoading, refetch } = useAssignmentAttempts(assignmentId, {
    status: 'IN_PROGRESS'
  });
  
  const [selectedAttempt, setSelectedAttempt] = useState<number | null>(null);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeAttempts = response?.content || [];

  const handleStopClick = (attemptId: number) => {
    setSelectedAttempt(attemptId);
    setShowStopDialog(true);
  };

  const handleWarningClick = (attemptId: number) => {
    setSelectedAttempt(attemptId);
    setWarningMessage('');
    setShowWarningDialog(true);
  };

  const handleConfirmStop = async () => {
    if (!selectedAttempt || !onSendStop) return;
    
    setIsSubmitting(true);
    try {
      await onSendStop(selectedAttempt);
      setShowStopDialog(false);
      setSelectedAttempt(null);
      // Refresh the list
      refetch();
    } catch (err) {
      // Error handling - log for development only
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to stop attempt:', err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWarning = async () => {
    if (!selectedAttempt || !onSendWarning || !warningMessage.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSendWarning(selectedAttempt, warningMessage);
      setShowWarningDialog(false);
      setSelectedAttempt(null);
      setWarningMessage('');
    } catch (err) {
      // Error handling - log for development only
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to send warning:', err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading active attempts...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Live Attempt Controls
              </CardTitle>
              <CardDescription>
                Monitor and control active quiz attempts in real-time
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Active Attempts Count */}
          <div className="mb-4 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">Active Attempts</span>
              </div>
              <Badge variant="default" className="text-lg px-3 py-1">
                {activeAttempts.length}
              </Badge>
            </div>
          </div>

          {/* Active Attempts List */}
          {activeAttempts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No active attempts at the moment
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Students will appear here when they start the quiz
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Student ID: {attempt.studentId}</Badge>
                        <Badge variant="secondary">Attempt #{attempt.id}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            Started {formatDistanceToNow(new Date(attempt.startedAt), { addSuffix: true })}
                          </span>
                        </div>
                        {attempt.timeSpent && (
                          <div>
                            Time: {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWarningClick(attempt.id)}
                        disabled={!onSendWarning}
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Warning
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStopClick(attempt.id)}
                        disabled={!onSendStop}
                      >
                        <StopCircle className="h-4 w-4 mr-1" />
                        Stop
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stop Confirmation Dialog */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop Quiz Attempt?</DialogTitle>
            <DialogDescription>
              This will immediately force-submit the student's quiz. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              ⚠️ The student will receive a notification and their current answers will be automatically submitted.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStopDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmStop}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Stopping...' : 'Stop Quiz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Message Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Warning Message</DialogTitle>
            <DialogDescription>
              Send a warning message to the student taking this quiz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="warning-message">Warning Message</Label>
              <Textarea
                id="warning-message"
                placeholder="Enter your warning message here..."
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                rows={4}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                The student will see this message as a notification during their quiz.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWarningDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendWarning}
              disabled={isSubmitting || !warningMessage.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Sending...' : 'Send Warning'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
