'use client';

import { AlertTriangle, Plus } from 'lucide-react';
import React from 'react';
import { useTranslations } from 'next-intl';

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

import { QuestionDataDto } from '@/features/instructor/quiz/types/question';
import { QuestionDisplayItem } from './QuestionDisplayItem';

export interface QuestionsDisplayListProps {
  questions: QuestionDataDto[];
  _isLoading?: boolean;
  error?: unknown;
  showAnswers?: boolean;
  _onToggleShowAnswers?: () => void;
  // Optional action handlers
  onAddQuestion?: () => void;
  onEdit?: (q: QuestionDataDto) => void;
  onDelete?: (q: QuestionDataDto) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  isReorderPending?: boolean;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  // Display options
  showOrder?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  // Custom rendering for additional badges per question
  renderAdditionalBadges?: (question: QuestionDataDto, index: number) => React.ReactNode;
}

export function QuestionsDisplayList({
  questions,
  _isLoading = false,
  error,
  showAnswers = false,
  _onToggleShowAnswers,
  onAddQuestion,
  onEdit,
  onDelete,
  onReorder,
  isReorderPending = false,
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  showOrder = true,
  emptyTitle,
  emptyDescription,
  renderAdditionalBadges,
}: Readonly<QuestionsDisplayListProps>) {
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

  const onDragStart = (e: React.DragEvent<HTMLElement>, index: number) => {
    if (isReorderPending || !onReorder) return;
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    if (isReorderPending || !onReorder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent<HTMLElement>, toIndex: number) => {
    if (isReorderPending || !onReorder) return;
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
              {emptyTitle || t('common.questionsEmpty.title', {
                fallback: 'No questions yet',
              })}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-base leading-relaxed">
              {emptyDescription || t('common.questionsEmpty.description', {
                fallback:
                  'Start building your quiz by creating engaging questions that will challenge and educate your students.',
              })}
            </p>
            {onAddQuestion && (
              <Button onClick={onAddQuestion} size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                <Plus className="h-5 w-5 mr-2" />
                {t('common.addQuestion', { fallback: 'Add Question' })}
              </Button>
            )}
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
        <div
          className="space-y-4 touch-pan-y overscroll-contain"
          role="list"
          aria-label={onReorder ? t('common.reorderQuestions.ariaList', {
            fallback: 'Questions (drag to reorder)',
          }) : t('common.questions', { fallback: 'Questions' })}
        >
          {questions.map((question, index) => (
            <QuestionDisplayItem
              key={question.id}
              question={question}
              index={index}
              showAnswers={showAnswers}
              onEdit={onEdit}
              onDelete={onDelete}
              onMoveUp={onReorder ? () => onReorder(index, index - 1) : undefined}
              onMoveDown={onReorder ? () => onReorder(index, index + 1) : undefined}
              disableReorder={isReorderPending}
              onDragStart={onReorder ? onDragStart : undefined}
              onDragOver={onReorder ? onDragOver : undefined}
              onDrop={onReorder ? onDrop : undefined}
              isDragDisabled={isReorderPending}
              showOrder={showOrder}
              additionalBadges={renderAdditionalBadges?.(question, index)}
            />
          ))}
        </div>

        {/* Pagination */}
        {onPageChange && (totalPages > 1 || totalElements > pageSize) && (
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
    </>
  );
}
