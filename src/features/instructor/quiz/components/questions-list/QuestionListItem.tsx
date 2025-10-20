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
    <Item variant="outline" className="sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded">
              #{index + 1}
            </span>
            <Badge variant="outline" className="text-xs">
              {getQuestionTypeLabel(t, question.questionType)}
            </Badge>
            <Badge variant="secondary" className="text-xs" title={t('common.points.short', { count: question.points, fallback: '{count} pts' })}>
              {t('common.points.short', {
                count: question.points,
                fallback: '{count} pts',
              })}
            </Badge>
          </div>

          {/* Display rich text content */}
          <div className="text-sm sm:text-base font-medium line-clamp-3 break-words">
            {question.content?.includes('<') ? (
              <RichTextDisplay
                content={question.content}
                className="prose-sm max-w-none"
              />
            ) : (
              <p>{question.content}</p>
            )}
          </div>

          {question.explanation && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {stripHtml(question.explanation)}
            </p>
          )}
          <QuestionOptionsPreview
            q={question}
            showCorrect={showAnswers}
            t={t}
          />
        </div>
        <div className="flex items-start gap-1">
          {/* Accessible reorder controls */}
          <div className="flex flex-col gap-1 mr-1" aria-label={t('common.reorder', { fallback: 'Reorder' })}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
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
              className="h-8 w-8"
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
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" aria-label={t('common.actions', { fallback: 'Actions' })}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(question)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('common.edit', { fallback: 'Edit' })}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(question)}
                className="text-destructive"
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
    prevProps.disableReorder === nextProps.disableReorder
  );
});
