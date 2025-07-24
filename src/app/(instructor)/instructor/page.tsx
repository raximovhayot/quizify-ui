'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useNextAuth } from '@/hooks/useNextAuth';
import { DashboardLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { apiClient } from '@/lib/api';
import { CacheManager } from '@/lib/performance';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  Plus
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
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.firstName}!
          </h1>
          <Button asChild>
            <Link href="/instructor/quizzes/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Link>
          </Button>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.activeAssignments}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.averageScore}%</div>
              </CardContent>
            </Card>
          </div>
        ) : null}

      </div>
    </DashboardLayout>
  );
}