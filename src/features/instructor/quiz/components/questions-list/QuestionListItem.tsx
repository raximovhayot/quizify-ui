'use client';

import { ArrowDown, ArrowUp, Edit, GripVertical, MoreVertical, Trash2 } from 'lucide-react';
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
}: Readonly<QuestionListItemProps>) {
  const t = useTranslations();

  return (
    <div className="group relative bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden">
      {/* Drag handle indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start gap-4 p-5">
        {/* Left side: Question number and drag handle */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
            {index + 1}
          </div>
          <GripVertical className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs font-medium border-primary/20 bg-primary/5">
              {getQuestionTypeLabel(t, question.questionType)}
            </Badge>
            <Badge variant="secondary" className="text-xs font-medium" title={t('common.points.short', { count: question.points, fallback: '{count} pts' })}>
              {t('common.points.short', {
                count: question.points,
                fallback: '{count} pts',
              })}
            </Badge>
          </div>

          {/* Question content */}
          <div className="text-base font-medium leading-relaxed text-foreground">
            {question.content?.includes('<') ? (
              <RichTextDisplay
                content={question.content}
                className="prose-sm max-w-none [&>p]:leading-relaxed"
              />
            ) : (
              <p className="leading-relaxed">{question.content}</p>
            )}
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="bg-muted/30 rounded-md p-3 border border-border/50">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground/70 mr-1">Explanation:</span>
                {stripHtml(question.explanation)}
              </p>
            </div>
          )}

          {/* Options preview */}
          <QuestionOptionsPreview
            q={question}
            showCorrect={showAnswers}
            t={t}
          />
        </div>

        {/* Right side: Actions */}
        <div className="flex items-start gap-1.5 pt-1">
          {/* Reorder buttons */}
          <div className="flex flex-col gap-0.5" aria-label={t('common.reorder', { fallback: 'Reorder' })}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
              title={t('common.up', { fallback: 'Up' })}
              aria-label={t('common.up', { fallback: 'Up' })}
              onClick={onMoveUp}
              disabled={disableReorder || index === 0}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
              title={t('common.down', { fallback: 'Down' })}
              aria-label={t('common.down', { fallback: 'Down' })}
              onClick={onMoveDown}
              disabled={disableReorder}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" 
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
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.question.id === nextProps.question.id &&
    prevProps.question.content === nextProps.question.content &&
    prevProps.question.order === nextProps.question.order &&
    prevProps.index === nextProps.index &&
    prevProps.showAnswers === nextProps.showAnswers &&
    prevProps.disableReorder === nextProps.disableReorder
  );
});
