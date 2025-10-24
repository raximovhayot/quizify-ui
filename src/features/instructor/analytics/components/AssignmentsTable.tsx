'use client';

import { FileText } from 'lucide-react';

import { memo } from 'react';

import { useTranslations } from 'next-intl';

import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';
import { Table, TableBody } from '@/components/ui/table';

import { AssignmentDTO } from '../types/assignment';
import { AssignmentsTableHeader } from './AssignmentsTableHeader';
import { AssignmentsTableRow } from './AssignmentsTableRow';

export interface AssignmentsTableProps {
  assignments: AssignmentDTO[];
  totalElements?: number;
  searchQuery?: string;
  className?: string;
  onDelete?: (id: number) => void;
  onPublish?: (id: number) => void;
  onUnpublish?: (id: number) => void;
  isMutating?: boolean;
}

function AssignmentsTableComponent({
  assignments,
  totalElements,
  searchQuery = '',
  className,
  onDelete,
  onPublish,
  onUnpublish,
  isMutating = false,
}: Readonly<AssignmentsTableProps>) {
  const t = useTranslations();

  if (assignments.length === 0) {
    return (
      <ContentPlaceholder
        icon={FileText}
        title={t('instructor.analytics.list.empty.title', {
          fallback: 'No assignments found',
        })}
        description={
          searchQuery
            ? t('instructor.analytics.list.filtered.empty.description', {
                fallback: 'Try adjusting your search criteria',
              })
            : t('instructor.analytics.list.empty.description', {
                fallback: 'Assignments will appear here once created',
              })
        }
        className={`border-none shadow-none ${className || ''}`}
      />
    );
  }

  // Use totalElements if available, otherwise fall back to current page size
  const displayCount = totalElements ?? assignments.length;

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Results count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('instructor.analytics.results.count', {
            fallback: '{count} assignment(s)',
            count: displayCount,
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <AssignmentsTableHeader />
          <TableBody>
            {assignments.map((assignment) => (
              <AssignmentsTableRow
                key={assignment.id}
                assignment={assignment}
                onDelete={onDelete}
                onPublish={onPublish}
                onUnpublish={onUnpublish}
                disabled={isMutating}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export const AssignmentsTable = memo(AssignmentsTableComponent);
