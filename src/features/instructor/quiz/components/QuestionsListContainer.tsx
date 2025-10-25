'use client';

import { useState } from 'react';

import { useReorderQuestions } from '../hooks/useReorderQuestions';
import {
  useDeleteQuestion,
  useQuestions,
  useUpdateQuestion,
} from '../hooks/useQuestions';
import type { TInstructorQuestionForm } from '../schemas/questionSchema';
import { toInstructorQuestionSaveRequest } from '../schemas/questionSchema';
import type { QuestionDataDto } from '../types/question';
import { QuestionsListView } from './QuestionsListView';

export interface QuestionsListContainerProps {
  quizId: number;
  onAddQuestion: () => void;
}

export function QuestionsListContainer({
  quizId,
  onAddQuestion,
}: Readonly<QuestionsListContainerProps>) {
  const [editingQuestion, setEditingQuestion] = useState<QuestionDataDto | null>(
    null
  );
  const [deletingQuestion, setDeletingQuestion] =
    useState<QuestionDataDto | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10; // Show 10 questions per page

  const filter = { quizId, page: currentPage, size: pageSize } as const;
  const {
    data: questionsData,
    isLoading,
    error,
  } = useQuestions(filter);

  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();
  const reorderMutation = useReorderQuestions(quizId, filter);

  const questions = questionsData?.content || [];

  const reorder = (fromIndex: number, toIndex: number) => {
    if (
      reorderMutation.isPending ||
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= questions.length ||
      toIndex >= questions.length
    ) {
      return;
    }
    const next = [...questions];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;
    next.splice(toIndex, 0, moved);
    const normalized = next.map((q, idx) => ({ ...q, order: idx }));
    reorderMutation.mutate(normalized);
  };

  const handleEditQuestion = async (formData: TInstructorQuestionForm) => {
    if (!editingQuestion) return;

    try {
      const payload = toInstructorQuestionSaveRequest({
        ...formData,
        quizId,
      });
      await updateQuestionMutation.mutateAsync({
        questionId: editingQuestion.id,
        data: payload,
      });
      setEditingQuestion(null);
    } catch {
      // Errors handled by mutation toast
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestion) return;

    try {
      await deleteQuestionMutation.mutateAsync({
        quizId,
        questionId: deletingQuestion.id,
      });
      setDeletingQuestion(null);
    } catch {
      // Errors handled by mutation toast
    }
  };

  return (
    <QuestionsListView
      quizId={quizId}
      questions={questions}
      isLoading={isLoading}
      error={error}
      showAnswers={showAnswers}
      onToggleShowAnswers={() => setShowAnswers((v) => !v)}
      onAddQuestion={onAddQuestion}
      onReorder={reorder}
      isReorderPending={reorderMutation.isPending}
      editingQuestion={editingQuestion}
      deletingQuestion={deletingQuestion}
      onRequestEdit={(q) => setEditingQuestion(q)}
      onRequestDelete={(q) => setDeletingQuestion(q)}
      onCloseEdit={() => setEditingQuestion(null)}
      onCloseDelete={() => setDeletingQuestion(null)}
      onSubmitEdit={handleEditQuestion}
      onConfirmDelete={handleDeleteQuestion}
      isUpdatePending={updateQuestionMutation.isPending}
      isDeletePending={deleteQuestionMutation.isPending}
      currentPage={questionsData?.page || 0}
      totalPages={questionsData?.totalPages || 0}
      totalElements={questionsData?.totalElements || 0}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
    />
  );
}
