'use client';

import { AlertTriangle, Plus } from 'lucide-react';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useResponsive } from '@/components/shared/hooks/useResponsive';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import type { TInstructorQuestionForm } from '../schemas/questionSchema';
import { QuestionDataDto } from '../types/question';
import { DeleteQuestionDialog } from './questions-list/DeleteQuestionDialog';
import { QuestionEditorDialog } from './QuestionEditorDialog';
import { QuestionListItem } from './questions-list/QuestionListItem';
import { QuestionsListHeader } from './questions-list/QuestionsListHeader';
import { QuestionsListSkeleton } from './questions-list/QuestionsListSkeleton';

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
  const t = useTranslations();
  const { isMobile } = useResponsive();
  const [liveNode, setLiveNode] = React.useState<HTMLDivElement | null>(null);

  const announce = (message: string) => {
    if (liveNode) {
      liveNode.textContent = message;
      setTimeout(() => {
        if (liveNode) liveNode.textContent = '';
      }, 1000);
    }
  };

  const onDragStart = (e: React.DragEvent<HTMLElement>, index: number) => {
    if (isReorderPending) return;
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    if (isReorderPending) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent<HTMLElement>, toIndex: number) => {
    if (isReorderPending) return;
    e.preventDefault();
    const fromStr = e.dataTransfer.getData('text/plain');
    const fromIndex = Number(fromStr);
    if (Number.isFinite(fromIndex)) {
      onReorder(fromIndex, toIndex);
      announce(
        t('common.movedToPosition', {
          fallback: 'Moved to position {pos}',
          pos: toIndex + 1,
        })
      );
    }
  };

  if (isLoading) {
    return <QuestionsListSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t('common.error.title', {
                fallback: 'Something went wrong',
              })}
            </h3>
            <p className="text-muted-foreground">
              {t('common.error.description', {
                fallback:
                  'There was a problem loading the data. Please try again.',
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="pt-6">
          <div className="text-center py-16">
            <div className="mx-auto w-28 h-28 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Plus className="h-14 w-14 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">
              {t('common.questionsEmpty.title', {
                fallback: 'No questions yet',
              })}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-base leading-relaxed">
              {t('common.questionsEmpty.description', {
                fallback:
                  'Start building your quiz by creating engaging questions that will challenge and educate your students.',
              })}
            </p>
            <Button onClick={onAddQuestion} size="lg" className="shadow-md hover:shadow-lg transition-shadow">
              <Plus className="h-5 w-5 mr-2" />
              {t('common.addQuestion', { fallback: 'Add Question' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Live region for announcements */}
      <div ref={setLiveNode} aria-live="polite" className="sr-only" />

      <div className="space-y-6">
        <QuestionsListHeader
          count={totalElements}
          showAnswers={showAnswers}
          onToggleShowAnswers={onToggleShowAnswers}
          onAddQuestion={onAddQuestion}
        />
        <div
          className="space-y-4 touch-pan-y overscroll-contain"
          role="list"
          aria-label={t('common.reorderQuestions.ariaList', {
            fallback: 'Questions (drag to reorder)',
          })}
        >
          {questions.map((question, index) => (
            <QuestionListItem
              key={question.id}
              question={question}
              index={index}
              showAnswers={showAnswers}
              onEdit={onRequestEdit}
              onDelete={onRequestDelete}
              onMoveUp={() => onReorder(index, index - 1)}
              onMoveDown={() => onReorder(index, index + 1)}
              disableReorder={isReorderPending}
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, index)}
              isDragDisabled={isReorderPending || isMobile}
            />
          ))}
        </div>

        {/* Pagination */}
        {(totalPages > 1 || totalElements > pageSize) && (
          <div className="flex justify-center pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => onPageChange(i)}
                      isActive={currentPage === i}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(Math.min(Math.max(0, totalPages - 1), currentPage + 1))}
                    className={currentPage >= totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
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
