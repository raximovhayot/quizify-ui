'use client';

import { Edit, MoreVertical, Trash2 } from 'lucide-react';

import { useTranslations } from 'next-intl';

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
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
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
              {t('common.points.short', {
                count: question.points,
                fallback: '{count} pts',
              })}
            </Badge>
          </div>
          <p className="text-sm font-medium line-clamp-2">{question.content}</p>
          {question.explanation && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {question.explanation}
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
  );
}
