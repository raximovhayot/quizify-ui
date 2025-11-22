'use client';

import React, { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface SubmitConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  totalQuestions: number;
  answeredQuestions: number;
  isSubmitting?: boolean;
}

/**
 * SubmitConfirmationDialog component for confirming quiz submission
 * Features:
 * - Shows unanswered questions count
 * - Requires confirmation checkbox
 * - Displays loading state during submission
 */
export function SubmitConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  totalQuestions,
  answeredQuestions,
  isSubmitting = false,
}: SubmitConfirmationDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const unansweredCount = totalQuestions - answeredQuestions;

  const handleConfirm = () => {
    if (confirmed) {
      onConfirm();
      setConfirmed(false); // Reset for next time
    }
  };

  const handleCancel = () => {
    setConfirmed(false);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to submit your quiz? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Quiz Summary */}
          <div className="rounded-md bg-muted p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total Questions:</span>
              <span className="text-sm">{totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Answered:</span>
              <span className="text-sm text-green-600 dark:text-green-500">{answeredQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Unanswered:</span>
              <span className="text-sm text-destructive">{unansweredCount}</span>
            </div>
          </div>

          {/* Warning for unanswered questions */}
          {unansweredCount > 0 && (
            <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-500">
              ⚠️ You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}. 
              Unanswered questions will be marked as incorrect.
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-submit"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              disabled={isSubmitting}
            />
            <Label
              htmlFor="confirm-submit"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand that I cannot change my answers after submitting
            </Label>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!confirmed || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
