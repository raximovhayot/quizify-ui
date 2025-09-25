'use client';

import { FileText } from 'lucide-react';

import { memo } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';
import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';
import { Table, TableBody } from '@/components/ui/table';

import { useQuizTableSorting } from '../hooks/useQuizTableSorting';
import { QuizDataDTO, QuizStatus } from '../types/quiz';
import { QuizTableHeader } from './QuizTableHeader';
import { QuizTableRow } from './QuizTableRow';

export interface QuizTableProps {
  quizzes: QuizDataDTO[];
  onDelete: (quizId: number) => void;
  onUpdateStatus: (quizId: number, status: QuizStatus) => void;
  isDeleting?: boolean;
  isUpdatingStatus?: boolean;
  searchQuery?: string;
  className?: string;
}

function QuizTableComponent({
  quizzes,
  onDelete,
  onUpdateStatus,
  isDeleting = false,
  isUpdatingStatus = false,
  searchQuery = '',
  className,
}: Readonly<QuizTableProps>) {
  const t = useTranslations();
  const router = useRouter();

  // Use the sorting hook
  const { sortField, sortDirection, processedQuizzes, handleSort } =
    useQuizTableSorting({
      quizzes,
      searchQuery,
    });

  if (processedQuizzes.length === 0 && quizzes.length === 0) {
    return (
      <ContentPlaceholder
        icon={FileText}
        title={t('instructor.quiz.list.empty.title', {
          fallback: 'No quizzes found',
        })}
        description={t('instructor.quiz.list.empty.description', {
          fallback: 'Create your first quiz to get started',
        })}
        actions={[
          {
            label: t('instructor.quiz.create.button', {
              fallback: 'Create Quiz',
            }),
            onClick: () => router.push(ROUTES_APP.quizzes.new()),
            variant: 'default',
          },
        ]}
        className={`border-none shadow-none ${className || ''}`}
      />
    );
  }

  if (processedQuizzes.length === 0 && quizzes.length > 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
          {t('instructor.quiz.list.filtered.empty.title', {
            fallback: 'No quizzes match your search',
          })}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('instructor.quiz.list.filtered.empty.description', {
            fallback: 'Try adjusting your search criteria',
          })}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Results count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('instructor.quiz.results.count', {
            fallback: '{count} quiz(s)',
            count: processedQuizzes.length,
          })}
          {quizzes.length !== processedQuizzes.length && (
            <span className="ml-1">
              {t('instructor.quiz.results.filtered', {
                fallback: 'of {total}',
                total: quizzes.length,
              })}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <QuizTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <TableBody>
            {processedQuizzes.map((quiz) => (
              <QuizTableRow
                key={quiz.id}
                quiz={quiz}
                onDelete={onDelete}
                onUpdateStatus={onUpdateStatus}
                isDeleting={isDeleting}
                isUpdatingStatus={isUpdatingStatus}
                searchQuery={searchQuery}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export const QuizTable = memo(QuizTableComponent);
