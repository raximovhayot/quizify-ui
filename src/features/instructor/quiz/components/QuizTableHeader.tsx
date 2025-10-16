'use client';

import { ArrowUpDown } from 'lucide-react';

import { memo } from 'react';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

type SortField = 'title' | 'status' | 'numberOfQuestions';
type SortDirection = 'asc' | 'desc';

export interface QuizTableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

function QuizTableHeaderComponent({
  sortField,
  sortDirection,
  onSort,
}: Readonly<QuizTableHeaderProps>) {
  const t = useTranslations();

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3" />;
    }

    return (
      <ArrowUpDown
        className={`ml-1 h-3 w-3 ${
          sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'
        } transition-transform`}
      />
    );
  };

  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        {/* Sortable Title Column */}
        <TableHead className="w-[300px]">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => onSort('title')}
            aria-label={t('instructor.quiz.table.sort.aria', {
              fallback: 'Sort by {field}',
              field: t('instructor.quiz.table.title', { fallback: 'Title' }),
            })}
          >
            {t('instructor.quiz.table.title', { fallback: 'Title' })}
            {getSortIcon('title')}
          </Button>
        </TableHead>

        {/* Sortable Status Column */}
        <TableHead className="w-[120px]">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => onSort('status')}
            aria-label={t('instructor.quiz.table.sort.aria', {
              fallback: 'Sort by {field}',
              field: t('instructor.quiz.table.status', { fallback: 'Status' }),
            })}
          >
            {t('instructor.quiz.table.status', { fallback: 'Status' })}
            {getSortIcon('status')}
          </Button>
        </TableHead>

        {/* Sortable Questions Column */}
        <TableHead className="w-[100px] text-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => onSort('numberOfQuestions')}
            aria-label={t('instructor.quiz.table.sort.aria', {
              fallback: 'Sort by {field}',
              field: t('instructor.quiz.table.questions', {
                fallback: 'Questions',
              }),
            })}
          >
            {t('instructor.quiz.table.questions', { fallback: 'Questions' })}
            {getSortIcon('numberOfQuestions')}
          </Button>
        </TableHead>

        <TableHead className="w-[80px] text-right">
          {t('instructor.quiz.table.actions', { fallback: 'Actions' })}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

export const QuizTableHeader = memo(QuizTableHeaderComponent);
