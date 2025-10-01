'use client';

import { format } from 'date-fns';
import { Eye } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';

import { AssignmentDTO, AssignmentStatus } from '../types/assignment';

export interface AssignmentsTableRowProps {
  assignment: AssignmentDTO;
}

export function AssignmentsTableRow({ assignment }: AssignmentsTableRowProps) {
  const t = useTranslations();

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
      case AssignmentStatus.PUBLISHED:
        return 'default' as const;
      case AssignmentStatus.DRAFT:
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          <span className="truncate">{assignment.title}</span>
          {assignment.description && (
            <span className="text-xs text-muted-foreground truncate">
              {assignment.description}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusVariant(assignment.status)}>
          {assignment.status === AssignmentStatus.PUBLISHED
            ? t('common.published', { fallback: 'Published' })
            : t('common.draft', { fallback: 'Draft' })}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(assignment.createdDate)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(assignment.dueDate)}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" disabled>
          <Eye className="h-4 w-4 mr-2" />
          {t('common.view', { fallback: 'View' })}
        </Button>
      </TableCell>
    </TableRow>
  );
}
