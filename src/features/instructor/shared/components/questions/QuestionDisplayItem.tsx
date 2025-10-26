'use client';

import { ArrowDown, ArrowUp, Edit, MoreVertical, Trash2 } from 'lucide-react';
import React from 'react';

import { useTranslations } from 'next-intl';

import {
  RichTextDisplay,
  stripHtml,
} from '@/components/shared/form/RichTextEditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Item } from '@/components/ui/item';

import { QuestionDataDto } from '@/features/instructor/quiz/types/question';
import { getQuestionTypeLabel } from '@/features/instructor/quiz/components/factories/questionFormRegistry';
import { QuestionOptionsPreview } from '@/features/instructor/quiz/components/factories/questionPreviewRegistry';

export interface QuestionDisplayItemProps {
  question: QuestionDataDto;
  index: number;
  showAnswers?: boolean;
  // Optional action handlers - if not provided, actions are hidden
  onEdit?: (q: QuestionDataDto) => void;
  onDelete?: (q: QuestionDataDto) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  disableReorder?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLElement>, index: number) => void;
  onDragOver?: (e: React.DragEvent<HTMLElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLElement>, index: number) => void;
  isDragDisabled?: boolean;
  // Additional display options
  showOrder?: boolean; // Whether to show question number/order
  additionalBadges?: React.ReactNode; // Additional badges to display (e.g., analytics data)
}

export const QuestionDisplayItem = React.memo(function QuestionDisplayItem({
  question,
  index,
  showAnswers = false,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  disableReorder = false,
  onDragStart,
  onDragOver,
  onDrop,
  isDragDisabled = false,
  showOrder = true,
  additionalBadges,
}: Readonly<QuestionDisplayItemProps>) {
  const t = useTranslations();
  const hasActions = !!(onEdit || onDelete);
  const hasReordering = !!(onMoveUp || onMoveDown || onDragStart);

  return (
    <Item 
      variant="outline" 
      className="sm:p-6 hover:shadow-md hover:border-primary/20 transition-all duration-200 group/card bg-card"
      role="listitem"
      onDragOver={hasReordering ? onDragOver : undefined}
      onDrop={hasReordering && onDrop ? (e) => onDrop(e, index) : undefined}
    >
      <div className="flex flex-col gap-4 w-full">
        {/* Question metadata header with ordering and action buttons */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2.5 flex-wrap">
            {showOrder && (
              <span 
                {...(hasReordering && !isDragDisabled ? {
                  className: "text-sm font-bold text-primary shrink-0 bg-primary/10 px-3 py-1 rounded-md border border-primary/20 cursor-grab active:cursor-grabbing select-none",
                  draggable: true,
                  onDragStart: (e: React.DragEvent<HTMLElement>) => onDragStart?.(e, index),
                  'aria-grabbed': false as const,
                  'aria-label': t('common.dragToReorder', { fallback: 'Drag to reorder' })
                } : {
                  className: "text-sm font-bold text-primary shrink-0 bg-primary/10 px-3 py-1 rounded-md border border-primary/20 select-none"
                })}
              >
                #{index + 1}
              </span>
            )}
            <Badge variant="outline" className="text-xs font-semibold border-muted-foreground/30">
              {getQuestionTypeLabel(t, question.questionType)}
            </Badge>
            <Badge 
              variant="secondary" 
              className="text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" 
              title={t('common.points.short', { count: question.points, fallback: '{count} pts' })}
            >
              {t('common.points.short', {
                count: question.points,
                fallback: '{count} pts',
              })}
            </Badge>
            {additionalBadges}
          </div>
          
          {/* Ordering and action buttons - horizontal layout */}
          {(hasReordering || hasActions) && (
            <div className="flex items-center gap-1.5">
              {/* Accessible reorder controls - horizontal */}
              {hasReordering && (
                <div 
                  className="flex gap-1 p-1 rounded-md bg-muted/30 group-hover/card:bg-muted/50 transition-colors" 
                  aria-label={t('common.reorder', { fallback: 'Reorder' })}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-background/80 hover:text-primary transition-colors"
                    title={t('common.up', { fallback: 'Up' })}
                    aria-label={t('common.up', { fallback: 'Up' })}
                    onClick={onMoveUp}
                    disabled={disableReorder || index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-background/80 hover:text-primary transition-colors"
                    title={t('common.down', { fallback: 'Down' })}
                    aria-label={t('common.down', { fallback: 'Down' })}
                    onClick={onMoveDown}
                    disabled={disableReorder}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {hasActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 shrink-0 hover:bg-muted hover:text-primary transition-colors" 
                      aria-label={t('common.actions', { fallback: 'Actions' })}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(question)} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        {t('common.edit', { fallback: 'Edit' })}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(question)}
                        className="text-destructive cursor-pointer focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('common.delete', { fallback: 'Delete' })}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>

        {/* Question content - full width */}
        <div className="text-sm sm:text-base font-medium leading-relaxed break-words overflow-hidden w-full">
          {question.content?.includes('<') ? (
            <RichTextDisplay
              content={question.content}
              className="prose-sm max-w-none [&>p]:leading-relaxed [&>*]:break-words"
            />
          ) : (
            <p className="text-foreground/90 break-words">{question.content}</p>
          )}
        </div>

        {/* Explanation if exists */}
        {question.explanation && (
          <div className="pt-2 border-t border-border/50 w-full">
            <p className="text-xs sm:text-sm text-muted-foreground/80 italic line-clamp-2 leading-relaxed break-words">
              {stripHtml(question.explanation)}
            </p>
          </div>
        )}
        
        {/* Answer options */}
        <QuestionOptionsPreview
          q={question}
          showCorrect={showAnswers}
          t={t}
        />
      </div>
    </Item>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.question.id === nextProps.question.id &&
    prevProps.question.content === nextProps.question.content &&
    prevProps.question.order === nextProps.question.order &&
    prevProps.index === nextProps.index &&
    prevProps.showAnswers === nextProps.showAnswers &&
    prevProps.disableReorder === nextProps.disableReorder &&
    prevProps.isDragDisabled === nextProps.isDragDisabled
  );
});
