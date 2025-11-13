'use client';

import { memo } from 'react';
import { format } from 'date-fns';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';

import { ROUTES_APP } from '../../routes';
import { AssignmentDTO, AssignmentStatus } from '../types/assignment';
import { AssignmentsTableActions } from './AssignmentsTableActions';

export interface AssignmentsTableRowProps {
  assignment: AssignmentDTO;
  onDelete?: (id: number) => void;
  onPublish?: (id: number) => void;
  onUnpublish?: (id: number) => void;
  disabled?: boolean;
}

export const AssignmentsTableRow = memo(function AssignmentsTableRow({
  assignment,
  onDelete,
  onPublish,
  onUnpublish,
  disabled = false,
}: Readonly<AssignmentsTableRowProps>) {
  const t = useTranslations();
  const router = useRouter();

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return '—';
    }
  };

  const getStatusVariant = (status: AssignmentStatus | string | undefined) => {
    switch (status) {
      case AssignmentStatus.STARTED:
        return 'default' as const;
      case AssignmentStatus.FINISHED:
        return 'secondary' as const;
      case AssignmentStatus.CREATED:
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusLabel = (status: AssignmentStatus | string | undefined) => {
    switch (status) {
      case AssignmentStatus.CREATED:
        return t('instructor.analytics.status.created', { fallback: 'Created' });
      case AssignmentStatus.STARTED:
        return t('instructor.analytics.status.started', { fallback: 'Started' });
      case AssignmentStatus.FINISHED:
        return t('instructor.analytics.status.finished', { fallback: 'Finished' });
      default:
        return status || '—';
    }
  };

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">
        <button
          type="button"
          onClick={() => router.push(ROUTES_APP.analytics.detail(assignment.id))}
          className="w-full text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('instructor.analytics.row.aria', {
            fallback: 'Open assignment {title}',
            title: assignment.title || t('instructor.analytics.untitled', { fallback: 'Untitled' }),
          })}
        >
          <div className="flex flex-col gap-1">
            <span className="truncate">{assignment.title}</span>
            {assignment.description && (
              <span className="text-xs text-muted-foreground truncate">
                {assignment.description}
              </span>
            )}
          </div>
        </button>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusVariant(assignment.status)}>
          {getStatusLabel(assignment.status)}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(assignment.createdDate)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(assignment.dueDate)}
      </TableCell>
      <TableCell className="text-right">
        <AssignmentsTableActions
          id={assignment.id}
          viewHref={ROUTES_APP.analytics.detail(assignment.id)}
          onDelete={onDelete ? () => onDelete(assignment.id) : undefined}
          onPublish={onPublish ? () => onPublish(assignment.id) : undefined}
          onUnpublish={
            onUnpublish ? () => onUnpublish(assignment.id) : undefined
          }
          disabled={disabled}
        />
      </TableCell>
    </TableRow>
  );
});
