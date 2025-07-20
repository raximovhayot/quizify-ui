'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  Plus,
  Eye,
  Calendar,
  Award,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalQuizzes: number;
  totalAssignments: number;
  totalStudents: number;
  totalAttempts: number;
  averageScore: number;
  activeAssignments: number;
}

interface RecentActivity {
  id: string;
  type: 'quiz_created' | 'assignment_created' | 'student_joined' | 'quiz_completed';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function InstructorDashboard() {
  const { user, hasRole, isAuthenticated, isLoading } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    // Check if user is authenticated and has instructor role
    if (!isLoading && (!isAuthenticated || !hasRole('INSTRUCTOR'))) {
      router.push('/sign-in');
      return;
    }

    // Load dashboard data
    if (isAuthenticated && hasRole('INSTRUCTOR')) {
      loadDashboardData();
    }
  }, [isAuthenticated, hasRole, isLoading, router]);

  const loadDashboardData = async () => {
    setIsLoadingData(true);

    try {
      // TODO: Replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      setDashboardStats({
        totalQuizzes: 12,
        totalAssignments: 8,
        totalStudents: 45,
        totalAttempts: 234,
        averageScore: 78.5,
        activeAssignments: 3,
      });

      setRecentActivity([
        {
          id: '1',
          type: 'quiz_created',
          title: 'Mathematics Quiz #5',
          description: 'Created a new quiz with 15 questions',
          timestamp: '2 hours ago',
          icon: BookOpen,
        },
        {
          id: '2',
          type: 'student_joined',
          title: 'New Student Joined',
          description: 'John Doe joined Assignment #3',
          timestamp: '4 hours ago',
          icon: Users,
        },
        {
          id: '3',
          type: 'quiz_completed',
          title: 'Quiz Completed',
          description: '5 students completed Physics Quiz #2',
          timestamp: '6 hours ago',
          icon: Award,
        },
        {
          id: '4',
          type: 'assignment_created',
          title: 'Chemistry Assignment',
          description: 'Created new assignment for Chapter 5',
          timestamp: '1 day ago',
          icon: ClipboardList,
        },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isLoading || !user) {
    return (
      <DashboardLayout title="Instructor Dashboard">
        <div className="flex items-center justify-center py-12">
          <InlineLoading text={t('common.loading')} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Instructor Dashboard">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening with your courses today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/instructor/quizzes/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        {isLoadingData ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dashboardStats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalQuizzes}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.activeAssignments}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.totalAssignments} total assignments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  Across all assignments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.averageScore}%</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% from last week
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Your latest actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description} • {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/instructor/quizzes/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Quiz
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/instructor/assignments/create">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Create Assignment
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/instructor/quizzes">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Quizzes
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/instructor/analytics">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}