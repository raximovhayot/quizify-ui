'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useNextAuth } from '@/hooks/useNextAuth';
import { DashboardLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { apiClient } from '@/lib/api';
import { 
  BookOpen, 
  ClipboardList, 
  Clock, 
  Award,
  TrendingUp,
  Calendar,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  averageScore: number;
  totalQuizzesTaken: number;
  upcomingDeadlines: number;
}

interface StudentAssignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: string;
  bestScore?: number;
  canStartNewAttempt: boolean;
  isExpired: boolean;
  latestAttempt?: {
    status: string;
    endTime?: string;
    startTime: string;
  };
}

interface UpcomingItem {
  id: string;
  type: 'assignment' | 'quiz';
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  score?: number;
}

interface RecentResult {
  id: string;
  title: string;
  subject: string;
  score: number;
  maxScore: number;
  completedAt: string;
  status: 'passed' | 'failed';
}

export default function StudentDashboard() {
  const { user, hasRole, isAuthenticated, isLoading } = useNextAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [upcomingItems, setUpcomingItems] = useState<UpcomingItem[]>([]);
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    // Check if user is authenticated and has student role
    if (!isLoading && (!isAuthenticated || !hasRole('STUDENT'))) {
      router.push('/sign-in');
      return;
    }

    // Load dashboard data
    if (isAuthenticated && hasRole('STUDENT')) {
      loadDashboardData();
    }
  }, [isAuthenticated, hasRole, isLoading, router]);

  const loadDashboardData = async () => {
    setIsLoadingData(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Load student assignments from API
      const response = await apiClient.get('/student/assignments', accessToken);
      
      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      const assignments: StudentAssignment[] = response.data || [];
      
      // Calculate dashboard stats from assignments
      const totalAssignments = assignments.length;
      const completedAssignments = assignments.filter((a: StudentAssignment) => a.latestAttempt?.status === 'completed').length;
      const pendingAssignments = assignments.filter((a: StudentAssignment) => a.canStartNewAttempt && !a.isExpired).length;
      const averageScore = assignments
        .filter((a: StudentAssignment) => a.bestScore !== null)
        .reduce((sum: number, a: StudentAssignment, _, arr: StudentAssignment[]) => sum + (a.bestScore || 0) / arr.length, 0);

      setDashboardStats({
        totalAssignments,
        completedAssignments,
        pendingAssignments,
        averageScore: Math.round(averageScore * 10) / 10,
        totalQuizzesTaken: assignments.filter((a: StudentAssignment) => a.latestAttempt).length,
        upcomingDeadlines: assignments.filter((a: StudentAssignment) => {
          const dueDate = new Date(a.dueDate);
          const now = new Date();
          const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7;
        }).length,
      });

      // Transform assignments to upcoming items
      const upcomingItems = assignments
        .filter((a: StudentAssignment) => a.canStartNewAttempt && !a.isExpired)
        .slice(0, 5)
        .map((assignment: StudentAssignment) => ({
          id: assignment.id,
          type: 'assignment' as const,
          title: assignment.title,
          subject: assignment.subject,
          dueDate: assignment.dueDate,
          status: assignment.latestAttempt ? 'in-progress' as const : 'pending' as const,
        }));

      setUpcomingItems(upcomingItems);

      // Transform completed assignments to recent results
      const recentResults = assignments
        .filter((a: StudentAssignment) => a.latestAttempt?.status === 'completed')
        .slice(0, 5)
        .map((assignment: StudentAssignment) => ({
          id: assignment.id,
          title: assignment.title,
          subject: assignment.subject,
          score: assignment.bestScore || 0,
          maxScore: 100, // Assuming percentage-based scoring
          completedAt: assignment.latestAttempt?.endTime || assignment.latestAttempt?.startTime,
          status: (assignment.bestScore || 0) >= 60 ? 'passed' as const : 'failed' as const,
        }));

      setRecentResults(recentResults);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty data on error
      setDashboardStats({
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        averageScore: 0,
        totalQuizzesTaken: 0,
        upcomingDeadlines: 0,
      });
      setUpcomingItems([]);
      setRecentResults([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const formatDueDate = (dateString: string) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: UpcomingItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading || !user) {
    return (
      <DashboardLayout title="Student Dashboard">
        <div className="flex items-center justify-center py-12">
          <InlineLoading text={t('common.loading')} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.firstName}!
          </h1>
          <Button asChild>
            <Link href="/join">
              <Play className="w-4 h-4 mr-2" />
              Join Assignment
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
                <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalAssignments}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.completedAssignments} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.pendingAssignments}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.upcomingDeadlines} due soon
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalQuizzesTaken}</div>
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Assignments & Quizzes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Upcoming Tasks</span>
              </CardTitle>
              <CardDescription>
                Your assignments and quizzes due soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
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
                  {upcomingItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        {item.type === 'assignment' ? (
                          <ClipboardList className="w-4 h-4 text-primary" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          {getStatusIcon(item.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.subject} • {formatDueDate(item.dueDate)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/${item.type}s/${item.id}`}>
                          {item.status === 'completed' ? 'View' : 'Start'}
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Recent Results</span>
              </CardTitle>
              <CardDescription>
                Your latest quiz and assignment scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                      </div>
                      <div className="h-6 w-12 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.subject} • {formatDate(result.completedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${getScoreColor(result.score, result.maxScore)}`}>
                          {result.score}/{result.maxScore}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((result.score / result.maxScore) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
