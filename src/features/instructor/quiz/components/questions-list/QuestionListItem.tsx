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

import { QuestionDataDto } from '../../types/question';
import { getQuestionTypeLabel } from '../factories/questionFormRegistry';
import { QuestionOptionsPreview } from '../factories/questionPreviewRegistry';

export interface QuestionListItemProps {
  question: QuestionDataDto;
  index: number;
  showAnswers: boolean;
  onEdit: (q: QuestionDataDto) => void;
  onDelete: (q: QuestionDataDto) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  disableReorder?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  isDragDisabled?: boolean;
}

export const QuestionListItem = React.memo(function QuestionListItem({
  question,
  index,
  showAnswers,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  disableReorder = false,
  onDragStart,
  onDragOver,
  onDrop,
  isDragDisabled = false,
}: Readonly<QuestionListItemProps>) {
  const t = useTranslations();

  return (
    <Item 
      variant="outline" 
      className="sm:p-6 hover:shadow-md hover:border-primary/20 transition-all duration-200 group/card bg-card"
      role="listitem"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, index)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4 min-w-0">
          {/* Question metadata header */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span 
              className="text-sm font-bold text-primary shrink-0 bg-primary/10 px-3 py-1 rounded-md border border-primary/20 cursor-grab active:cursor-grabbing select-none"
              draggable={!isDragDisabled}
              onDragStart={(e) => onDragStart?.(e, index)}
              aria-grabbed={false}
              aria-label={t('common.dragToReorder', { fallback: 'Drag to reorder' })}
            >
              #{index + 1}
            </span>
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
          </div>

          {/* Question content */}
          <div className="text-sm sm:text-base font-medium leading-relaxed break-words overflow-hidden">
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
            <div className="pt-2 border-t border-border/50">
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
        
        {/* Action buttons */}
        <div className="flex items-start gap-1.5">
          {/* Accessible reorder controls */}
          <div 
            className="flex flex-col gap-1 mr-1 p-1 rounded-md bg-muted/30 group-hover/card:bg-muted/50 transition-colors" 
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
              <DropdownMenuItem onClick={() => onEdit(question)} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                {t('common.edit', { fallback: 'Edit' })}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(question)}
                className="text-destructive cursor-pointer focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('common.delete', { fallback: 'Delete' })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
