'use client';

import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: assignment, isLoading, error } = useAssignment(assignmentId);

  const tabParam = searchParams.get('tab');
  const initialTab = tabParam === 'questions' ? 'questions' : 'attempts';
  const [activeTab, setActiveTab] = useState(initialTab);

  const updateSearchParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === undefined || value === '' || value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}` , { scroll: false });
  };

  useEffect(() => {
    const tp = searchParams.get('tab');
    const normalized = tp === 'questions' ? 'questions' : 'attempts';
    setActiveTab((prev) => (prev !== normalized ? normalized : prev));
  }, [searchParams]);

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
              <Tabs
                value={activeTab}
                onValueChange={(val) => {
                  setActiveTab(val);
                  updateSearchParam('tab', val);
                }}
                className="w-full"
              >
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
