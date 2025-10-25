'use client';

import { FileText } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';

import { useAssignment } from '../hooks';
import { AssignmentViewActions } from './AssignmentViewActions';
import { AssignmentViewAttempts } from './AssignmentViewAttempts';
import { AssignmentViewConfiguration } from './AssignmentViewConfiguration';
import { AssignmentViewHeader } from './AssignmentViewHeader';
import { AssignmentViewQuestions } from './AssignmentViewQuestions';
import { AssignmentViewSkeleton } from './AssignmentViewSkeleton';

export interface AssignmentViewPageProps {
  assignmentId: number;
}

export function AssignmentViewPage({
  assignmentId,
}: Readonly<AssignmentViewPageProps>) {
  const t = useTranslations();
  const router = useRouter();
  const { data: assignment, isLoading, error } = useAssignment(assignmentId);

  if (isLoading) {
    return <AssignmentViewSkeleton />;
  }

  if (error || !assignment) {
    return (
      <ContentPlaceholder
        icon={FileText}
        title={t('instructor.assignment.view.error.title', {
          fallback: 'Assignment not found',
        })}
        description={t('instructor.assignment.view.error.description', {
          fallback:
            'The assignment you are looking for does not exist or has been deleted.',
        })}
        actions={[
          {
            label: t('instructor.assignment.view.backToList', {
              fallback: 'Back to Assignments',
            }),
            onClick: () => router.push('/instructor/analytics'),
            variant: 'default',
          },
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        <div className="space-y-6 sm:space-y-8">
          {/* Header with back button and status */}
          <AssignmentViewHeader assignment={assignment} />

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Sidebar (Settings + Actions) - first on mobile, right column on desktop */}
            <div className="order-1 lg:order-2 lg:col-span-1 space-y-6">
              <AssignmentViewConfiguration assignment={assignment} />
              <AssignmentViewActions assignment={assignment} />
            </div>

            {/* Main content - attempts and questions */}
            <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
              <AssignmentViewAttempts assignmentId={assignmentId} />
              <AssignmentViewQuestions assignmentId={assignmentId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
