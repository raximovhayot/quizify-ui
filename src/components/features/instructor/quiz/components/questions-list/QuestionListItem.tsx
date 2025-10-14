'use client';

import { Edit, MoreVertical, Trash2 } from 'lucide-react';

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
}

export function QuestionListItem({
  question,
  index,
  showAnswers,
  onEdit,
  onDelete,
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
            <Badge variant="secondary" className="text-xs">
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
                className="prose-sm"
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
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
    </Item>
  );
}
