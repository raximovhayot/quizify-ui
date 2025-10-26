'use client';

import { FileText } from 'lucide-react';
import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useAssignment } from '../hooks';
import { AssignmentViewConfiguration } from './AssignmentViewConfiguration';
import { AssignmentViewHeader } from './AssignmentViewHeader';
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        <div className="space-y-6 sm:space-y-8">
          {/* Header with status */}
          <AssignmentViewHeader assignment={assignment} />

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Sidebar (Settings) - first on mobile, right column on desktop */}
            <div className="order-1 lg:order-2 lg:col-span-1">
              <AssignmentViewConfiguration assignment={assignment} />
            </div>

            {/* Main content (Tabs) - main content on desktop, last on mobile */}
            <div className="order-2 lg:order-1 lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="attempts">
                    {t('instructor.analytics.attempts.title', { fallback: 'Attempts' })}
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
      </div>
    </div>
  );
}
