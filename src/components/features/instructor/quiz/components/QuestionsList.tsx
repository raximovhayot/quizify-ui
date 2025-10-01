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

export function QuestionsList({ quizId, onAddQuestion }: QuestionsListProps) {
  const t = useTranslations();
  const [editingQuestion, setEditingQuestion] =
    useState<QuestionDataDto | null>(null);
  const [deletingQuestion, setDeletingQuestion] =
    useState<QuestionDataDto | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const {
    data: questionsData,
    isLoading,
    error,
  } = useQuestions({ quizId, page: 0, size: 100 });

  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();

  const questions = questionsData?.content || [];

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
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestion) return;

    try {
      await deleteQuestionMutation.mutateAsync(deletingQuestion.id);
      setDeletingQuestion(null);
    } catch (e) {
      console.error(e);
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
      <Card>
        <QuestionsListHeader
          count={questions.length}
          showAnswers={showAnswers}
          onToggleShowAnswers={() => setShowAnswers((v) => !v)}
          onAddQuestion={onAddQuestion}
        />
        <CardContent>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionListItem
                key={question.id}
                question={question}
                index={index}
                showAnswers={showAnswers}
                onEdit={(q) => setEditingQuestion(q)}
                onDelete={(q) => setDeletingQuestion(q)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

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
