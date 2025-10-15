'use client';

import { AlertTriangle, Plus } from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import {
  useDeleteQuestion,
  useQuestions,
  useUpdateQuestion,
} from '../hooks/useQuestions';
import { useReorderQuestions } from '../hooks/useReorderQuestions';
import {
  TInstructorQuestionForm,
  toInstructorQuestionSaveRequest,
} from '../schemas/questionSchema';
import { QuestionDataDto } from '../types/question';
import { DeleteQuestionDialog } from './questions-list/DeleteQuestionDialog';
import { EditQuestionDialog } from './questions-list/EditQuestionDialog';
import { QuestionListItem } from './questions-list/QuestionListItem';
import { QuestionsListHeader } from './questions-list/QuestionsListHeader';
import { QuestionsListSkeleton } from './questions-list/QuestionsListSkeleton';

export interface QuestionsListProps {
  quizId: number;
  onAddQuestion: () => void;
}

export function QuestionsList({
  quizId,
  onAddQuestion,
}: Readonly<QuestionsListProps>) {
  const t = useTranslations();
  const [editingQuestion, setEditingQuestion] =
    useState<QuestionDataDto | null>(null);
  const [deletingQuestion, setDeletingQuestion] =
    useState<QuestionDataDto | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const filter = { quizId, page: 0, size: 100 } as const;
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

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (reorderMutation.isPending) return;
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (reorderMutation.isPending) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
    if (reorderMutation.isPending) return;
    e.preventDefault();
    const fromStr = e.dataTransfer.getData('text/plain');
    const fromIndex = Number(fromStr);
    if (Number.isFinite(fromIndex)) {
      reorder(fromIndex, toIndex);
    }
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
    } catch {}
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestion) return;

    try {
      await deleteQuestionMutation.mutateAsync({
        quizId,
        questionId: deletingQuestion.id,
      });
      setDeletingQuestion(null);
    } catch {}
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

  if (questions.length === 0) {
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
      <div className="space-y-4">
        <QuestionsListHeader
          count={questions.length}
          showAnswers={showAnswers}
          onToggleShowAnswers={() => setShowAnswers((v) => !v)}
          onAddQuestion={onAddQuestion}
        />
        <div className="space-y-4" role="list" aria-label={t('common.reorderQuestions.ariaList', { fallback: 'Questions (drag to reorder)' })}>
          {questions.map((question, index) => (
            <div
              key={question.id}
              role="listitem"
              draggable={!reorderMutation.isPending}
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
                onEdit={(q) => setEditingQuestion(q)}
                onDelete={(q) => setDeletingQuestion(q)}
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
        isSubmitting={updateQuestionMutation.isPending}
        onClose={() => setEditingQuestion(null)}
        onSubmit={handleEditQuestion}
      />

      {/* Delete Question Modal */}
      <DeleteQuestionDialog
        open={!!deletingQuestion}
        isSubmitting={deleteQuestionMutation.isPending}
        onClose={() => setDeletingQuestion(null)}
        onConfirm={handleDeleteQuestion}
      />
    </>
  );
}
