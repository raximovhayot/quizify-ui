'use client';

import { useParams } from 'next/navigation';

import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';

import {
  useAssignmentAnalytics,
  useQuestionAnalytics,
} from '../hooks/useAnalytics';
import { AnalyticsOverview } from './AnalyticsOverview';
import { AttemptsTable } from './AttemptsTable';
import { QuestionAnalyticsTable } from './QuestionAnalyticsTable';

export function AssignmentAnalyticsPage() {
  const params = useParams();
  const assignmentId = Number(params.id);

  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useAssignmentAnalytics(assignmentId);

  const {
    data: questionAnalytics,
    isLoading: questionLoading,
  } = useQuestionAnalytics(assignmentId);

  if (analyticsError) {
    return (
      <ContentPlaceholder
        title="Failed to load analytics"
        description="There was an error loading the assignment analytics."
      />
    );
  }

  return (
    <div className="space-y-6">
      {analytics && (
        <AnalyticsOverview
          analytics={analytics}
          loading={analyticsLoading}
        />
      )}

      {analytics && (
        <AttemptsTable
          attempts={analytics.attempts}
          loading={analyticsLoading}
        />
      )}

      {questionAnalytics && (
        <QuestionAnalyticsTable
          analytics={questionAnalytics}
          loading={questionLoading}
        />
      )}
    </div>
  );
}
