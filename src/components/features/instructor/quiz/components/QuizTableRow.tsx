'use client';

import { FileText } from 'lucide-react';

import { memo, useCallback } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';

import { QuizDataDTO, QuizStatus } from '../types/quiz';
import { QuizTableActions } from './QuizTableActions';

export interface QuizTableRowProps {
  quiz: QuizDataDTO;
  onDelete: (quizId: number) => void;
  onUpdateStatus: (quizId: number, status: QuizStatus) => void;
  isDeleting?: boolean;
  isUpdatingStatus?: boolean;
  searchQuery?: string;
}

function QuizTableRowComponent({
  quiz,
  onDelete,
  onUpdateStatus,
  isDeleting = false,
  isUpdatingStatus = false,
  searchQuery = '',
}: Readonly<QuizTableRowProps>) {
  const t = useTranslations();
  const router = useRouter();

  const getStatusColor = (status: QuizStatus) => {
    switch (status) {
      case QuizStatus.PUBLISHED:
        return 'default';
      case QuizStatus.DRAFT:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: QuizStatus) => {
    switch (status) {
      case QuizStatus.PUBLISHED:
        return t('common.published', { fallback: 'Published' });
      case QuizStatus.DRAFT:
        return t('common.draft', { fallback: 'Draft' });
      default:
        return status;
    }
  };

  // Highlight search terms in text
  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi'
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  }, []);

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the actions dropdown or its children
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-radix-collection-item]') ||
      target.closest('button')
    ) {
      return;
    }

    router.push(ROUTES_APP.quizzes.detail(quiz.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(ROUTES_APP.quizzes.detail(quiz.id));
    }
  };

  return (
    <TableRow
      className="hover:bg-muted/50 transition-colors cursor-pointer focus:bg-muted/50"
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={t('instructor.quiz.row.aria', {
        fallback: 'Quiz row for {title}',
        title:
          quiz.title?.trim() ||
          t('instructor.quiz.untitled', { fallback: 'Untitled' }),
      })}
    >
      {/* Title Column with Search Highlighting */}
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium leading-none">
            {highlightText(
              quiz.title?.trim() ||
                t('instructor.quiz.untitled', { fallback: 'Untitled' }),
              searchQuery
            )}
          </div>
          {quiz.description && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {highlightText(quiz.description, searchQuery)}
            </div>
          )}
        </div>
      </TableCell>

      {/* Status Column */}
      <TableCell>
        <Badge variant={getStatusColor(quiz.status)}>
          {getStatusLabel(quiz.status)}
        </Badge>
      </TableCell>

      {/* Questions Count Column */}
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{quiz.numberOfQuestions}</span>
        </div>
      </TableCell>

      {/* Actions Column */}
      <TableCell className="text-right">
        <QuizTableActions
          quiz={quiz}
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
          isDeleting={isDeleting}
          isUpdatingStatus={isUpdatingStatus}
        />
      </TableCell>
    </TableRow>
  );
}

export const QuizTableRow = memo(QuizTableRowComponent);
