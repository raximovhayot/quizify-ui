'use client';

import { Calendar, Clock, Eye, Users } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { AssignmentDTO, AssignmentStatus } from '../types/assignment';

export interface AssignmentCardProps {
  assignment: AssignmentDTO;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const t = useTranslations();

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString();
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg truncate">
              {assignment.title}
            </h3>
            {assignment.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {assignment.description}
              </p>
            )}
          </div>
          <Badge variant={getStatusVariant(assignment.status)}>
            {getStatusLabel(assignment.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {assignment.createdDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {t('instructor.analytics.assignment.created', {
                  fallback: 'Created',
                })}
                : {formatDate(assignment.createdDate)}
              </span>
            </div>
          )}
          {assignment.dueDate && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {t('instructor.analytics.assignment.due', { fallback: 'Due' })}:{' '}
                {formatDate(assignment.dueDate)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {t('instructor.analytics.assignment.students', {
                fallback: '— students',
              })}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Eye className="h-4 w-4 mr-2" />
            {t('instructor.analytics.assignment.view', {
              fallback: 'View Details',
            })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
