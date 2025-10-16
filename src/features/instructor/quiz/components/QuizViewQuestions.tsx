'use client';

import { useState } from 'react';

import type { QuizDataDTO } from '../types/quiz';
import { CreateQuestionModal } from './CreateQuestionModal';
import { QuestionsListContainer } from './QuestionsListContainer';

export interface QuizViewQuestionsProps {
  quiz: QuizDataDTO;
}

export function QuizViewQuestions({ quiz }: Readonly<QuizViewQuestionsProps>) {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <>
      <QuestionsListContainer
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
