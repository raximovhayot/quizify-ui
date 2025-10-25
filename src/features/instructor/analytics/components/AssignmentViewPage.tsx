'use client';

import { FileText } from 'lucide-react';
import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useAssignment, useAttempts } from '../hooks';
import { AnalyticsOverview } from './AnalyticsOverview';
import { AssignmentDetailHeader } from './AssignmentDetailHeader';
import { AssignmentViewSkeleton } from './AssignmentViewSkeleton';
import { AttemptsTabContent } from './AttemptsTabContent';
import { QuestionsTabContent } from './QuestionsTabContent';

export interface AssignmentViewPageProps {
  assignmentId: number;
}

export function AssignmentViewPage({
  assignmentId,
}: Readonly<AssignmentViewPageProps>) {
  const t = useTranslations();
  const router = useRouter();
  const { data: assignment, isLoading, error } = useAssignment(assignmentId);
  
  // Fetch first page of attempts for statistics
  const { data: attemptsData } = useAttempts(assignmentId, { page: 0, size: 100 });
  
  const [activeTab, setActiveTab] = useState('attempts');

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
            label: t('common.backToList', {
              fallback: 'Back to Assignments',
            }),
            onClick: () => router.push('/instructor/analytics'),
            variant: 'default',
          },
        ]}
      />
    );
  }

  // Compute basic analytics from attempts
  const attempts = attemptsData?.content || [];
  const completedAttempts = attempts.filter((a) => a.completed);
  const scores = completedAttempts
    .map((a) => a.score)
    .filter((s): s is number => s !== null);
  
  const analytics = {
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    quizTitle: '',
    totalRegistrations: new Set(attempts.map(a => a.studentId)).size,
    totalAttempts: attempts.length,
    completedAttempts: completedAttempts.length,
    inProgressAttempts: attempts.length - completedAttempts.length,
    averageScore: scores.length > 0 
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length 
      : null,
    highestScore: scores.length > 0 ? Math.max(...scores) : null,
    lowestScore: scores.length > 0 ? Math.min(...scores) : null,
    averageTimeSpent: null,
    attempts: [],
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Assignment Details Header */}
          <AssignmentDetailHeader assignment={assignment} />

          {/* Analytics Overview */}
          {attemptsData && <AnalyticsOverview analytics={analytics} />}

          {/* Tabs for Attempts and Questions */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="attempts">
                {t('common.attempts', { fallback: 'Attempts' })}
              </TabsTrigger>
              <TabsTrigger value="questions">
                {t('common.questions', { fallback: 'Questions' })}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attempts" className="mt-6">
              <AttemptsTabContent assignmentId={assignmentId} />
            </TabsContent>

            <TabsContent value="questions" className="mt-6">
              <QuestionsTabContent assignmentId={assignmentId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
