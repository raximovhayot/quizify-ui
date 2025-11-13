'use client';

import React, { useState } from 'react';
import { Loader2, Calendar, Clock, BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AssignmentPreview {
  id: number;
  quizTitle: string;
  startTime: string;
  endTime: string;
  description?: string;
  maxAttempts?: number;
  duration?: number; // in minutes
}

interface JoinAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (code: string) => Promise<void>;
  preview?: AssignmentPreview | null;
  isLoading?: boolean;
  isValidating?: boolean;
}

/**
 * JoinAssignmentDialog component for students to join assignments by code
 * Features:
 * - Code input field with validation
 * - Assignment preview before joining
 * - Join confirmation
 * - Loading states
 */
export function JoinAssignmentDialog({
  open,
  onOpenChange,
  onJoin,
  preview,
  isLoading = false,
  isValidating = false,
}: JoinAssignmentDialogProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleCodeChange = (value: string) => {
    setCode(value.toUpperCase().trim());
    setError('');
  };

  const handleJoin = async () => {
    if (!code) {
      setError('Please enter a join code');
      return;
    }

    try {
      await onJoin(code);
      setCode('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to join assignment. Please check the code and try again.');
    }
  };

  const handleCancel = () => {
    setCode('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Assignment</DialogTitle>
          <DialogDescription>
            Enter the code provided by your instructor to join an assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Code Input */}
          <div className="space-y-2">
            <Label htmlFor="join-code">Assignment Code</Label>
            <Input
              id="join-code"
              placeholder="Enter code (e.g., ABC123)"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="text-center text-lg font-mono uppercase tracking-wider"
              maxLength={10}
              disabled={isLoading || isValidating}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Assignment Preview */}
          {isValidating && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {preview && !isValidating && (
            <div className="rounded-md border bg-muted/50 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <BookOpen className="h-5 w-5 mt-0.5 text-primary" />
                <div className="flex-1">
                  <h4 className="font-semibold">{preview.quizTitle}</h4>
                  {preview.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {preview.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {/* Start/End Time */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(preview.startTime).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' - '}
                    {new Date(preview.endTime).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Duration */}
                {preview.duration && preview.duration > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{preview.duration} minutes per attempt</span>
                  </div>
                )}

                {/* Max Attempts */}
                {preview.maxAttempts && preview.maxAttempts > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Maximum attempts: {preview.maxAttempts}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleJoin}
            disabled={!code || isLoading || isValidating}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Assignment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
