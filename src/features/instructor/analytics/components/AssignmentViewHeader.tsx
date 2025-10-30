'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';

import { AssignmentDTO, AssignmentStatus } from '../types/assignment';

export interface AssignmentViewHeaderProps {
  assignment: AssignmentDTO;
}

export function AssignmentViewHeader({ assignment }: Readonly<AssignmentViewHeaderProps>) {
  const t = useTranslations();

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.STARTED:
        return 'default';
      case AssignmentStatus.FINISHED:
        return 'secondary';
      case AssignmentStatus.CREATED:
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.STARTED:
        return CheckCircle2;
      case AssignmentStatus.FINISHED:
      case AssignmentStatus.CREATED:
      default:
        return AlertCircle;
    }
  };

  const getStatusLabel = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.STARTED:
        return t('common.status.active', { fallback: 'Active' });
      case AssignmentStatus.FINISHED:
        return t('common.status.finished', { fallback: 'Finished' });
      case AssignmentStatus.CREATED:
      default:
        return t('common.status.draft', { fallback: 'Draft' });
    }
  };

  const status = assignment.status ?? AssignmentStatus.CREATED;
  const StatusIcon = getStatusIcon(status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          variant={getStatusColor(status)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5"
        >
          <StatusIcon className="h-4 w-4" />
          {getStatusLabel(status)}
        </Badge>
        {assignment.code && (
          <span className="text-sm text-muted-foreground">
            {t('common.accessCode', { fallback: 'Code' })}: <span className="font-mono font-semibold text-foreground">{assignment.code}</span>
          </span>
        )}
      </div>
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight break-words">
          {assignment.title || t('instructor.analytics.untitled', { fallback: 'Untitled Assignment' })}
        </h1>
        {assignment.description && (
          <p className="mt-2 text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {assignment.description}
          </p>
        )}
      </div>
    </div>
  );
}
