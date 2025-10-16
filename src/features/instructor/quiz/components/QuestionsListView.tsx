'use client';

import { AlertTriangle, Plus } from 'lucide-react';
import React from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import type { TInstructorQuestionForm } from '../schemas/questionSchema';
import { QuestionDataDto } from '../types/question';
import { DeleteQuestionDialog } from './questions-list/DeleteQuestionDialog';
import { EditQuestionDialog } from './questions-list/EditQuestionDialog';
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
}: Readonly<QuestionsListViewProps>) {
  const t = useTranslations();
  const [liveNode, setLiveNode] = React.useState<HTMLDivElement | null>(null);

  const announce = (message: string) => {
    if (liveNode) {
      liveNode.textContent = message;
      setTimeout(() => {
        if (liveNode) liveNode.textContent = '';
      }, 1000);
    }
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (isReorderPending) return;
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isReorderPending) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
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
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t('common.questionsEmpty.title', {
                fallback: 'No questions yet',
              })}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('common.questionsEmpty.description', {
                fallback:
                  'Start building your quiz by creating engaging questions that will challenge and educate your students.',
              })}
            </p>
            <Button onClick={onAddQuestion} size="lg">
              <Plus className="h-4 w-4 mr-2" />
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

      <div className="space-y-4">
        <QuestionsListHeader
          count={questions.length}
          showAnswers={showAnswers}
          onToggleShowAnswers={onToggleShowAnswers}
          onAddQuestion={onAddQuestion}
        />
        <div
          className="space-y-4"
          role="list"
          aria-label={t('common.reorderQuestions.ariaList', {
            fallback: 'Questions (drag to reorder)',
          })}
        >
          {questions.map((question, index) => (
            <div
              key={question.id}
              role="listitem"
              draggable={!isReorderPending}
              aria-grabbed={false}
              aria-label={t('common.dragToReorder', { fallback: 'Drag to reorder' })}
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, index)}
            >
              <QuestionListItem
                question={question}
                index={index}
                showAnswers={showAnswers}
                onEdit={onRequestEdit}
                onDelete={onRequestDelete}
                onMoveUp={() => onReorder(index, index - 1)}
                onMoveDown={() => onReorder(index, index + 1)}
                disableReorder={isReorderPending}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Edit Question Modal */}
      <EditQuestionDialog
        open={!!editingQuestion}
        question={editingQuestion}
        quizId={quizId}
        isSubmitting={isUpdatePending}
        onClose={onCloseEdit}
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
