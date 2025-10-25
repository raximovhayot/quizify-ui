'use client';

import { ArrowLeft, Download, FileEdit, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { AssignmentService } from '../services/assignmentService';
import { AssignmentAnalytics } from '../types/analytics';

interface AnalyticsOverviewProps {
  analytics: AssignmentAnalytics;
  loading?: boolean;
}

export function AnalyticsOverview({
  analytics,
  loading,
}: AnalyticsOverviewProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleExport = async () => {
    try {
      const blob = await AssignmentService.exportAnalytics(
        analytics.assignmentId
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assignment-${analytics.assignmentId}-analytics.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        t('instructor.analytics.exportSuccess', {
          fallback: 'Analytics exported successfully',
        })
      );
    } catch {
      toast.error(
        t('instructor.analytics.exportError', {
          fallback: 'Failed to export analytics',
        })
      );
    }
  };

  if (loading) {
    return <AnalyticsOverviewSkeleton />;
  }

  const stats = [
    {
      title: t('instructor.analytics.totalRegistrations', {
        fallback: 'Total Registrations',
      }),
      value: analytics.totalRegistrations,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: t('instructor.analytics.completedAttempts', {
        fallback: 'Completed Attempts',
      }),
      value: `${analytics.completedAttempts} / ${analytics.totalAttempts}`,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: t('instructor.analytics.averageScore', {
        fallback: 'Average Score',
      }),
      value:
        analytics.averageScore !== null
          ? `${analytics.averageScore.toFixed(1)}%`
          : '-',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: t('instructor.analytics.inProgress', {
        fallback: 'In Progress',
      }),
      value: analytics.inProgressAttempts,
      icon: Users,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold">{analytics.assignmentTitle}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('instructor.analytics.quiz', { fallback: 'Quiz' })}:{' '}
            {analytics.quizTitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              router.push(`/instructor/grading/${analytics.assignmentId}`)
            }
            variant="outline"
          >
            <FileEdit className="mr-2 h-4 w-4" />
            {t('instructor.grading.gradeEssays', { fallback: 'Grade Essays' })}
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t('instructor.analytics.export', { fallback: 'Export CSV' })}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Score Range */}
      {analytics.highestScore !== null && analytics.lowestScore !== null && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('instructor.analytics.scoreRange', {
                fallback: 'Score Range',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('instructor.analytics.lowest', { fallback: 'Lowest' })}
                </p>
                <p className="text-2xl font-bold">
                  {analytics.lowestScore.toFixed(1)}%
                </p>
              </div>
              <div className="h-px flex-1 bg-border mx-4" />
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {t('instructor.analytics.highest', { fallback: 'Highest' })}
                </p>
                <p className="text-2xl font-bold">
                  {analytics.highestScore.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AnalyticsOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
