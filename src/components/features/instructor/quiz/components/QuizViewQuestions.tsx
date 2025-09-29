'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useCreateQuestion } from '../hooks/useQuestions';
import type { TInstructorQuestionForm } from '../schemas/questionSchema';
import { toInstructorQuestionSaveRequest } from '../schemas/questionSchema';
import type { QuizDataDTO } from '../types/quiz';
import { QuestionForm } from './QuestionForm';
import { QuestionsList } from './QuestionsList';

export interface QuizViewQuestionsProps {
  quiz: QuizDataDTO;
}

export function QuizViewQuestions({ quiz }: QuizViewQuestionsProps) {
  const t = useTranslations();
  const [openCreate, setOpenCreate] = useState(false);
  const createQuestion = useCreateQuestion();

  const handleCreate = async (formData: TInstructorQuestionForm) => {
    const payload = toInstructorQuestionSaveRequest(formData);
    await createQuestion.mutateAsync(payload);
    setOpenCreate(false);
  };

  return (
    <>
      <QuestionsList
        quizId={quiz.id}
        onAddQuestion={() => setOpenCreate(true)}
      />

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('instructor.quiz.question.create.title', {
                fallback: 'Create Question',
              })}
            </DialogTitle>
          </DialogHeader>
          <QuestionForm
            quizId={quiz.id}
            isSubmitting={createQuestion.isPending}
            onCancel={() => setOpenCreate(false)}
            onSubmit={handleCreate}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
