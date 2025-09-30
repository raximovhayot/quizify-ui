'use client';

import {
  AlertTriangle,
  Edit,
  FileText,
  MoreVertical,
  Plus,
  Trash2,
  XIcon,
} from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

import {
  useDeleteQuestion,
  useQuestions,
  useUpdateQuestion,
} from '../hooks/useQuestions';
import {
  TInstructorQuestionForm,
  toInstructorQuestionSaveRequest,
} from '../schemas/questionSchema';
import { QuestionDataDto, QuestionType } from '../types/question';
import {
  QuestionFormRenderer,
  getQuestionTypeLabel,
} from './factories/questionFormRegistry';

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

  const {
    data: questionsData,
    isLoading,
    error,
  } = useQuestions({ quizId, page: 0, size: 100 });

  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();

  const questions = questionsData?.content || [];

  // label resolution is centralized in the registry via getQuestionTypeLabel(t, type)

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
              {t('instructor.quiz.questions.error.title', {
                fallback: 'Failed to load questions',
              })}
            </h3>
            <p className="text-muted-foreground">
              {t('instructor.quiz.questions.error.description', {
                fallback: 'There was an error loading the questions.',
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
              {t('instructor.quiz.questions.empty.title', {
                fallback: 'No questions yet',
              })}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('instructor.quiz.questions.empty.description', {
                fallback:
                  'Start building your quiz by creating engaging questions that will challenge and educate your students.',
              })}
            </p>
            <Button onClick={onAddQuestion} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              {t('instructor.quiz.question.add', { fallback: 'Add Question' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('instructor.quiz.questions.title', {
                fallback: 'Questions',
              })}{' '}
              ({questions.length})
            </CardTitle>
            <Button onClick={onAddQuestion} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('instructor.quiz.question.add', { fallback: 'Add Question' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getQuestionTypeLabel(t, question.questionType)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {question.points} pts
                      </Badge>
                    </div>
                    <p className="text-sm font-medium line-clamp-2">
                      {question.content}
                    </p>
                    {question.explanation && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditingQuestion(question)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t('common.edit', { fallback: 'Edit' })}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingQuestion(question)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('common.delete', { fallback: 'Delete' })}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Question Modal */}
      <Dialog
        open={!!editingQuestion}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setEditingQuestion(null);
        }}
      >
        <DialogContent
          className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
          showCloseButton={false}
        >
          <DialogClose
            type="button"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogHeader>
            <DialogTitle>
              {t('instructor.quiz.question.edit.title', {
                fallback: 'Edit Question',
              })}
            </DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <QuestionFormRenderer
              type={editingQuestion.questionType}
              quizId={quizId}
              initialData={editingQuestion}
              isSubmitting={updateQuestionMutation.isPending}
              onCancel={() => setEditingQuestion(null)}
              onSubmit={handleEditQuestion}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Question Modal */}
      <Dialog
        open={!!deletingQuestion}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeletingQuestion(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogClose
            type="button"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogHeader>
            <DialogTitle>
              {t('instructor.quiz.question.delete.title', {
                fallback: 'Delete Question',
              })}
            </DialogTitle>
            <DialogDescription>
              {t('instructor.quiz.question.delete.description', {
                fallback:
                  'Are you sure you want to delete this question? This action cannot be undone.',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingQuestion(null)}
              disabled={deleteQuestionMutation.isPending}
            >
              {t('common.cancel', { fallback: 'Cancel' })}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteQuestion}
              disabled={deleteQuestionMutation.isPending}
            >
              {deleteQuestionMutation.isPending
                ? t('common.deleting', { fallback: 'Deleting...' })
                : t('common.delete', { fallback: 'Delete' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function QuestionsListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
