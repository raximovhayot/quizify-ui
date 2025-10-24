'use client';

import { useTranslations } from 'next-intl';

import { QuizDataDTO } from '@/features/instructor/quiz/types';
import { useResponsive } from '@/components/shared/hooks/useResponsive';
import {
  FormDrawer,
  FormDrawerContent,
  FormDrawerHeader,
  FormDrawerTitle,
  FormDrawerBody,
} from '@/components/shared/ui/FormDrawer';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollableDialogContent } from '@/components/shared/ui/ScrollableDialogContent';

import { AssignmentForm } from './AssignmentForm';

export interface StartQuizDialogProps {
  quiz: QuizDataDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignmentDialog({
  quiz,
  open,
  onOpenChange,
}: Readonly<StartQuizDialogProps>) {
  const t = useTranslations();
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <FormDrawer open={open} onOpenChange={onOpenChange}>
        <FormDrawerContent side="bottom" open={open} className="rounded-t-2xl">
          <FormDrawerHeader className="pb-4">
            <FormDrawerTitle>
              {t('instructor.assignment.create.title', {
                default: 'Start Quiz',
              })}
            </FormDrawerTitle>
          </FormDrawerHeader>

          <FormDrawerBody>
            <AssignmentForm 
              quiz={quiz} 
              onSuccess={() => onOpenChange(false)}
              onCancel={() => onOpenChange(false)}
            />
          </FormDrawerBody>
        </FormDrawerContent>
      </FormDrawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {t('instructor.assignment.create.title', {
              default: 'Start Quiz',
            })}
          </DialogTitle>
          <DialogDescription>
            {t('instructor.assignment.create.description', {
              default:
                'Create an assignment to start the quiz for your students.',
            })}
          </DialogDescription>
        </DialogHeader>

        <AssignmentForm 
          quiz={quiz} 
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </ScrollableDialogContent>
    </Dialog>
  );
}
