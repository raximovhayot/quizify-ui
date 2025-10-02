'use client';

import { XIcon } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
      <DialogContent showCloseButton={false} className="rounded-2xl">
        <DialogClose
          type="button"
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <XIcon />
          <span className="sr-only">
            {t('common.close', { fallback: 'Close' })}
          </span>
        </DialogClose>
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
      </DialogContent>
    </Dialog>
  );
}
