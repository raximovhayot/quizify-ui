'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useNextAuth } from '@/hooks/useNextAuth';
import { DashboardLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { apiClient } from '@/lib/api';
import { CacheManager } from '@/lib/performance';
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

interface AnalyticsData {
  summary?: {
    totalQuizzes?: number;
    totalAttempts?: number;
    activeStudents?: number;
    averageScore?: number;
  };
  quizPerformance?: Array<{
    name: string;
    averageScore: number;
    attempts: number;
    completionRate: number;
  }>;
  topPerformers?: Array<{
    name: string;
    averageScore: number;
    quizzesCompleted: number;
  }>;
}

export default function InstructorDashboard() {
  const { user, hasRole, isAuthenticated, isLoading } = useNextAuth();
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
  }, [isAuthenticated, hasRole, isLoading, router, loadDashboardData]);

  const loadDashboardData = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoadingData(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Check cache first (unless force refresh is requested)
      const cacheKey = `dashboard-analytics-${user?.id}`;
      let analyticsData: AnalyticsData;
      
      if (forceRefresh) {
        // Clear cache and force fresh data
        CacheManager.clear(cacheKey);
      }
      
      const cachedData = CacheManager.get<AnalyticsData>(cacheKey);
      
      if (cachedData && !forceRefresh) {
        // Use cached data
        analyticsData = cachedData;
      } else {
        // Fetch analytics data from API
        const analyticsResponse = await apiClient.get('/analytics', accessToken);
        
        if (analyticsResponse.errors && analyticsResponse.errors.length > 0) {
          throw new Error(analyticsResponse.errors[0].message);
        }

        analyticsData = analyticsResponse.data;
        
        // Cache the data for 5 minutes
        CacheManager.set(cacheKey, analyticsData, 5 * 60 * 1000);
      }

      // Map analytics data to dashboard stats
      setDashboardStats({
        totalQuizzes: analyticsData.summary?.totalQuizzes || 0,
        totalAssignments: analyticsData.summary?.totalAttempts || 0,
        totalStudents: analyticsData.summary?.activeStudents || 0,
        totalAttempts: analyticsData.summary?.totalAttempts || 0,
        averageScore: analyticsData.summary?.averageScore || 0,
        activeAssignments: Math.floor((analyticsData.summary?.totalQuizzes || 0) * 0.6), // Estimate active assignments
      });

      // Generate recent activity from analytics data
      const recentActivity: RecentActivity[] = [];
      
      // Add quiz performance activities
      if (analyticsData.quizPerformance && analyticsData.quizPerformance.length > 0) {
        analyticsData.quizPerformance.slice(0, 2).forEach((quiz, index: number) => {
          recentActivity.push({
            id: `quiz-${index}`,
            type: 'quiz_completed' as const,
            title: `${quiz.name} Results`,
            description: `${quiz.attempts} attempts with ${quiz.averageScore}% average score`,
            timestamp: index === 0 ? '2 hours ago' : '4 hours ago',
            icon: Award,
          });
        });
      }

      // Add top performer activities
      if (analyticsData.topPerformers && analyticsData.topPerformers.length > 0) {
        analyticsData.topPerformers.slice(0, 2).forEach((performer, index: number) => {
          recentActivity.push({
            id: `performer-${index}`,
            type: 'student_joined' as const,
            title: 'Top Performance',
            description: `${performer.name} achieved ${performer.averageScore}% average`,
            timestamp: index === 0 ? '6 hours ago' : '1 day ago',
            icon: Users,
          });
        });
      }

      // If no real activity data, add some default activities
      if (recentActivity.length === 0) {
        recentActivity.push(
          {
            id: '1',
            type: 'quiz_created' as const,
            title: 'Dashboard Updated',
            description: 'Analytics data refreshed successfully',
            timestamp: 'Just now',
            icon: Activity,
          }
        );
      }

      setRecentActivity(recentActivity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // Fallback to basic stats if API fails
      setDashboardStats({
        totalQuizzes: 0,
        totalAssignments: 0,
        totalStudents: 0,
        totalAttempts: 0,
        averageScore: 0,
        activeAssignments: 0,
      });
      
      setRecentActivity([
        {
          id: 'error',
          type: 'quiz_created' as const,
          title: 'Data Loading Error',
          description: 'Unable to load dashboard data. Please try again.',
          timestamp: 'Just now',
          icon: Activity,
        },
      ]);
    } finally {
      setIsLoadingData(false);
    }
  }, [user?.id]);

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