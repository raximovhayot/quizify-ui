'use client';

import {
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
} from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function InstructorDashboard() {
  const t = useTranslations();

  // Mock data - in real app, this would come from API
  const stats = {
    totalQuizzes: 12,
    activeQuizzes: 8,
    totalStudents: 156,
    completedSubmissions: 89,
    averageScore: 78.5,
    recentActivity: [
      {
        id: 1,
        type: 'submission',
        student: 'John Doe',
        quiz: 'JavaScript Basics',
        score: 85,
        time: '2 hours ago',
      },
      {
        id: 2,
        type: 'completion',
        student: 'Jane Smith',
        quiz: 'React Fundamentals',
        score: 92,
        time: '4 hours ago',
      },
      {
        id: 3,
        type: 'submission',
        student: 'Mike Johnson',
        quiz: 'CSS Advanced',
        score: 76,
        time: '6 hours ago',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('instructor.dashboard.title', { fallback: 'Dashboard' })}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('instructor.dashboard.subtitle', {
              fallback:
                "Welcome back! Here's what's happening with your quizzes.",
            })}
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          {t('instructor.dashboard.createQuiz', {
            fallback: 'Create New Quiz',
          })}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <h3 className="text-xs sm:text-sm font-medium leading-tight">
              {t('instructor.dashboard.totalQuizzes', {
                fallback: 'Total Quizzes',
              })}
            </h3>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold">
              {stats.totalQuizzes}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeQuizzes}{' '}
              {t('instructor.dashboard.active', { fallback: 'active' })}
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <h3 className="text-xs sm:text-sm font-medium leading-tight">
              {t('instructor.dashboard.totalStudents', {
                fallback: 'Total Students',
              })}
            </h3>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold">
              {stats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('instructor.dashboard.enrolled', { fallback: 'enrolled' })}
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <h3 className="text-xs sm:text-sm font-medium leading-tight">
              {t('instructor.dashboard.submissions', {
                fallback: 'Submissions',
              })}
            </h3>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold">
              {stats.completedSubmissions}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('instructor.dashboard.thisWeek', { fallback: 'this week' })}
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <h3 className="text-xs sm:text-sm font-medium leading-tight">
              {t('instructor.dashboard.averageScore', {
                fallback: 'Average Score',
              })}
            </h3>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold">
              {stats.averageScore}%
            </div>
            <p className="text-xs text-green-600">
              +2.5%{' '}
              {t('instructor.dashboard.fromLastWeek', {
                fallback: 'from last week',
              })}
            </p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold">
              {t('instructor.dashboard.recentActivity', {
                fallback: 'Recent Activity',
              })}
            </h3>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              {t('instructor.dashboard.viewAll', { fallback: 'View All' })}
            </Button>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'submission' ? (
                      <Clock className="h-4 w-4 text-blue-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.student}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.quiz}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={activity.score >= 80 ? 'default' : 'secondary'}
                  >
                    {activity.score}%
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {t('instructor.dashboard.quickActions', {
                fallback: 'Quick Actions',
              })}
            </h3>
          </div>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              {t('instructor.dashboard.createQuiz', {
                fallback: 'Create New Quiz',
              })}
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              {t('instructor.dashboard.viewAnalytics', {
                fallback: 'View Analytics',
              })}
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              {t('instructor.dashboard.manageStudents', {
                fallback: 'Manage Students',
              })}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
