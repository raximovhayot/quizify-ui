'use client';

import { useState } from 'react';

import type { QuizDataDTO } from '../types/quiz';
import { CreateQuestionModal } from './CreateQuestionModal';
import { QuestionsList } from './QuestionsList';

export interface QuizViewQuestionsProps {
  quiz: QuizDataDTO;
}

export function QuizViewQuestions({ quiz }: QuizViewQuestionsProps) {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <>
      <QuestionsList
        quizId={quiz.id}
        onAddQuestion={() => setOpenCreate(true)}
      />

      <CreateQuestionModal
        quizId={quiz.id}
        open={openCreate}
        onOpenChange={setOpenCreate}
      />
    </>
  );
}
