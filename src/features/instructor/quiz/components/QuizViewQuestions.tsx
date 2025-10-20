'use client';

import { useState } from 'react';

import type { QuizDataDTO } from '../types/quiz';
import { QuestionEditorDialog } from './QuestionEditorDialog';
import { QuestionsListContainer } from './QuestionsListContainer';
import { useCreateQuestion } from '../hooks/useQuestions';
import { toInstructorQuestionSaveRequest } from '../schemas/questionSchema';
import type { TInstructorQuestionForm } from '../schemas/questionSchema';

export interface QuizViewQuestionsProps {
  quiz: QuizDataDTO;
}

export function QuizViewQuestions({ quiz }: Readonly<QuizViewQuestionsProps>) {
  const [openCreate, setOpenCreate] = useState(false);
  const createQuestion = useCreateQuestion();

  const handleCreate = async (formData: TInstructorQuestionForm) => {
    try {
      const payload = toInstructorQuestionSaveRequest(formData);
      await createQuestion.mutateAsync(payload);
      setOpenCreate(false);
    } catch {
      // Errors handled by mutation toast
    }
  };

  return (
    <>
      <QuestionsListContainer
        quizId={quiz.id}
        onAddQuestion={() => setOpenCreate(true)}
      />

      <QuestionEditorDialog
        mode="create"
        quizId={quiz.id}
        open={openCreate}
        onOpenChange={setOpenCreate}
        onSubmit={handleCreate}
        isSubmitting={createQuestion.isPending}
      />
    </>
  );
}
