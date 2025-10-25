'use client';

import { BarChart3, Clock, Target, TrendingUp, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { AssignmentAnalytics } from '../types/analytics';

interface AnalyticsOverviewProps {
  analytics: AssignmentAnalytics;
}

export function AnalyticsOverview({
  analytics,
}: Readonly<AnalyticsOverviewProps>) {
  const t = useTranslations();

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatScore = (score: number | null) => {
    if (score === null) return '-';
    return score.toFixed(1);
  };

  const stats = [
    {
      icon: Users,
      label: t('instructor.analytics.overview.totalRegistrations', {
        fallback: 'Total Registrations',
      }),
      value: analytics.totalRegistrations,
      description: t('instructor.analytics.overview.studentsEnrolled', {
        fallback: 'students enrolled',
      }),
      color: 'text-blue-600',
    },
    {
      icon: BarChart3,
      label: t('instructor.analytics.overview.totalAttempts', {
        fallback: 'Total Attempts',
      }),
      value: analytics.totalAttempts,
      description: t('instructor.analytics.overview.attemptsSubmitted', {
        fallback: 'attempts submitted',
      }),
      color: 'text-green-600',
    },
    {
      icon: Target,
      label: t('instructor.analytics.overview.averageScore', {
        fallback: 'Average Score',
      }),
      value: formatScore(analytics.averageScore),
      description:
        analytics.highestScore !== null && analytics.lowestScore !== null
          ? `${t('instructor.analytics.overview.range', { fallback: 'Range' })}: ${formatScore(analytics.lowestScore)} - ${formatScore(analytics.highestScore)}`
          : '-',
      color: 'text-purple-600',
    },
    {
      icon: Clock,
      label: t('instructor.analytics.overview.averageTime', {
        fallback: 'Average Time',
      }),
      value: formatTime(analytics.averageTimeSpent),
      description: t('instructor.analytics.overview.timeSpent', {
        fallback: 'per attempt',
      }),
      color: 'text-orange-600',
    },
    {
      icon: TrendingUp,
      label: t('instructor.analytics.overview.completedAttempts', {
        fallback: 'Completed',
      }),
      value: analytics.completedAttempts,
      description: `${t('instructor.analytics.overview.inProgress', { fallback: 'In Progress' })}: ${analytics.inProgressAttempts}`,
      color: 'text-teal-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
