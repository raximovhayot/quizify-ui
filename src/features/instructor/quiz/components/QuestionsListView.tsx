'use client';

import React from 'react';

import type { TInstructorQuestionForm } from '../schemas/questionSchema';
import { QuestionDataDto } from '../types/question';
import { DeleteQuestionDialog } from './questions-list/DeleteQuestionDialog';
import { QuestionEditorDialog } from './QuestionEditorDialog';
import { QuestionsListSkeleton } from './questions-list/QuestionsListSkeleton';
import { 
  QuestionsDisplayList, 
  QuestionsDisplayHeader 
} from '@/features/instructor/shared/components/questions';

export interface QuestionsListViewProps {
  quizId: number;
  questions: QuestionDataDto[];
  isLoading: boolean;
  error: unknown;
  showAnswers: boolean;
  onToggleShowAnswers: () => void;
  onAddQuestion: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  isReorderPending: boolean;
  // Edit/Delete modal state and handlers
  editingQuestion: QuestionDataDto | null;
  deletingQuestion: QuestionDataDto | null;
  onRequestEdit: (q: QuestionDataDto) => void;
  onRequestDelete: (q: QuestionDataDto) => void;
  onCloseEdit: () => void;
  onCloseDelete: () => void;
  onSubmitEdit: (data: TInstructorQuestionForm) => Promise<void>;
  onConfirmDelete: () => Promise<void> | void;
  isUpdatePending: boolean;
  isDeletePending: boolean;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function QuestionsListView({
  quizId,
  questions,
  isLoading,
  error,
  showAnswers,
  onToggleShowAnswers,
  onAddQuestion,
  onReorder,
  isReorderPending,
  editingQuestion,
  deletingQuestion,
  onRequestEdit,
  onRequestDelete,
  onCloseEdit,
  onCloseDelete,
  onSubmitEdit,
  onConfirmDelete,
  isUpdatePending,
  isDeletePending,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: Readonly<QuestionsListViewProps>) {
  if (isLoading) {
    return <QuestionsListSkeleton />;
  }

  return (
    <>
      <div className="space-y-6">
        <QuestionsDisplayHeader
          count={totalElements}
          showAnswers={showAnswers}
          onToggleShowAnswers={onToggleShowAnswers}
          onAddQuestion={onAddQuestion}
        />
        
        <QuestionsDisplayList
          questions={questions}
          error={error}
          showAnswers={showAnswers}
          onEdit={onRequestEdit}
          onDelete={onRequestDelete}
          onReorder={onReorder}
          isReorderPending={isReorderPending}
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      </div>

      {/* Edit Question Modal */}
      <QuestionEditorDialog
        mode="edit"
        open={!!editingQuestion}
        question={editingQuestion}
        quizId={quizId}
        isSubmitting={isUpdatePending}
        onOpenChange={(open) => !open && onCloseEdit()}
        onSubmit={onSubmitEdit}
      />

      {/* Delete Question Modal */}
      <DeleteQuestionDialog
        open={!!deletingQuestion}
        isSubmitting={isDeletePending}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
}
