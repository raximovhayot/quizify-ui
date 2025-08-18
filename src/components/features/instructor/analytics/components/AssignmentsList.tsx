'use client';

import { useTranslations } from 'next-intl';

import { AppPagination } from '@/components/shared/ui/AppPagination';
import { Card } from '@/components/ui/card';

import { AssignmentDTO, AssignmentStatus } from '../types/assignment';

export interface AssignmentsListProps {
  items: AssignmentDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function AssignmentsList({
  items,
  totalElements,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
}: AssignmentsListProps) {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t('instructor.analytics.assignments.title', {
            fallback: 'Assignments',
          })}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {t('instructor.analytics.assignments.subtitle', {
            fallback: 'Overview of assigned quizzes',
          })}
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {t('instructor.analytics.assignments.empty', {
              fallback: 'No assignments found.',
            })}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((a) => (
            <Card key={a.id} className="p-4 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {t('instructor.analytics.assignments.meta', {
                    fallback:
                      'Status: {status} · Created: {created} · Due: {due}',
                    status: a.status ?? AssignmentStatus.DRAFT,
                    created: a.createdDate
                      ? new Date(a.createdDate).toLocaleString()
                      : '—',
                    due: a.dueDate ? new Date(a.dueDate).toLocaleString() : '—',
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <AppPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}

      <p className="text-sm text-muted-foreground">
        {t('instructor.analytics.assignments.summary', {
          fallback: 'Showing {start} to {end} of {total} assignments',
          start: totalElements === 0 ? 0 : currentPage * pageSize + 1,
          end:
            totalElements === 0
              ? 0
              : Math.min((currentPage + 1) * pageSize, totalElements),
          total: totalElements,
        })}
      </p>
    </div>
  );
}
