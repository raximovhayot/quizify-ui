'use client';

import { XIcon } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollableDialogContent } from '@/components/shared/ui/ScrollableDialogContent';

export interface DeleteQuestionDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteQuestionDialog({
  open,
  isSubmitting,
  onClose,
  onConfirm,
}: Readonly<DeleteQuestionDialogProps>) {
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <ScrollableDialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {t('common.deleteQuestion', {
              fallback: 'Delete Question',
            })}
          </DialogTitle>
          <DialogDescription>
            {t('common.deleteConfirmation.question', {
              fallback:
                'Are you sure you want to delete this question? This action cannot be undone.',
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel', { fallback: 'Cancel' })}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t('common.deleting', { fallback: 'Deleting...' })
              : t('common.delete', { fallback: 'Delete' })}
          </Button>
        </DialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
}
