'use client';

import { ArrowLeft } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { AssignmentDTO, AssignmentStatus } from '../types/assignment';

interface AssignmentViewHeaderProps {
  assignment: AssignmentDTO;
}

export function AssignmentViewHeader({
  assignment,
}: Readonly<AssignmentViewHeaderProps>) {
  const t = useTranslations();
  const router = useRouter();

  const getStatusBadge = (status?: AssignmentStatus | string) => {
    switch (status) {
      case AssignmentStatus.STARTED:
        return (
          <Badge variant="default" className="bg-green-600">
            {t('instructor.assignment.status.started', { fallback: 'Active' })}
          </Badge>
        );
      case AssignmentStatus.FINISHED:
        return (
          <Badge variant="secondary">
            {t('instructor.assignment.status.finished', {
              fallback: 'Finished',
            })}
          </Badge>
        );
      case AssignmentStatus.CREATED:
      default:
        return (
          <Badge variant="outline">
            {t('instructor.assignment.status.created', { fallback: 'Draft' })}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/instructor/analytics')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('instructor.assignment.view.backToList', {
          fallback: 'Back to Assignments',
        })}
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {assignment.title}
            </h1>
            {getStatusBadge(assignment.status)}
          </div>
          {assignment.description && (
            <p className="text-muted-foreground">{assignment.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
