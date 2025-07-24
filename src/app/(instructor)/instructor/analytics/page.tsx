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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Award,
  Download,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  quizPerformance: Array<{
    name: string;
    averageScore: number;
    attempts: number;
    completionRate: number;
  }>;
  studentProgress: Array<{
    date: string;
    activeStudents: number;
    completedQuizzes: number;
  }>;
  scoreDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  topPerformers: Array<{
    name: string;
    averageScore: number;
    quizzesCompleted: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const { user, hasRole, isAuthenticated, isLoading } = useNextAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const router = useRouter();
  const t = useTranslations();

  const loadAnalyticsData = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoadingData(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Check cache first with period-specific key (unless force refresh is requested)
      const cacheKey = `analytics-${user?.id}-${selectedPeriod}`;
      let data: AnalyticsData;
      
      if (forceRefresh) {
        // Clear cache and force fresh data
        CacheManager.clear(cacheKey);
      }
      
      const cachedData = CacheManager.get<AnalyticsData>(cacheKey);
      
      if (cachedData && !forceRefresh) {
        // Use cached data
        data = cachedData;
      } else {
        // Fetch analytics data from API with period filter
        const analyticsResponse = await apiClient.get(`/analytics?period=${selectedPeriod}`, accessToken);
        
        if (analyticsResponse.errors && analyticsResponse.errors.length > 0) {
          throw new Error(analyticsResponse.errors[0].message);
        }

        data = analyticsResponse.data as AnalyticsData;
        
        // Cache the data for 3 minutes (shorter than dashboard since it's more detailed)
        CacheManager.set(cacheKey, data, 3 * 60 * 1000);
      }

      // Set analytics data directly from API response or cache
      setAnalyticsData({
        quizPerformance: data.quizPerformance || [],
        studentProgress: data.studentProgress || [],
        scoreDistribution: data.scoreDistribution || [],
        topPerformers: data.topPerformers || [],
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
      
      // Fallback to empty data if API fails
      setAnalyticsData({
        quizPerformance: [],
        studentProgress: [],
        scoreDistribution: [
          { range: 'No Data', count: 0, percentage: 100 }
        ],
        topPerformers: [],
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedPeriod, user?.id]);

  useEffect(() => {
    // Check if user is authenticated and has instructor role
    if (!isLoading && (!isAuthenticated || !hasRole('INSTRUCTOR'))) {
      router.push('/sign-in');
      return;
    }

    // Load analytics data
    if (isAuthenticated && hasRole('INSTRUCTOR')) {
      loadAnalyticsData();
    }
  }, [isAuthenticated, hasRole, isLoading, router, selectedPeriod, loadAnalyticsData]);

  const handleExportData = (format: 'pdf' | 'csv') => {
    // TODO: Implement actual export functionality
    console.log(`Exporting data as ${format.toUpperCase()}`);
    // This would typically call an API endpoint to generate and download the file
  };

  if (isLoading || !user) {
    return (
      <DashboardLayout title="Analytics">
        <div className="flex items-center justify-center py-12">
          <InlineLoading text={t('common.loading')} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Detailed performance insights and reporting
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              {(['week', 'month', 'quarter'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className="capitalize"
                >
                  {period}
                </Button>
              ))}
            </div>
            <Button variant="outline" onClick={() => handleExportData('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExportData('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {isLoadingData ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analyticsData ? (
          <>
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.quizPerformance.reduce((sum, quiz) => sum + quiz.attempts, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last {selectedPeriod}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(analyticsData.quizPerformance.reduce((sum, quiz) => sum + quiz.averageScore, 0) / analyticsData.quizPerformance.length)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +2.5% from last {selectedPeriod}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(analyticsData.quizPerformance.reduce((sum, quiz) => sum + quiz.completionRate, 0) / analyticsData.quizPerformance.length)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +5.2% from last {selectedPeriod}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.studentProgress[analyticsData.studentProgress.length - 1]?.activeStudents || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +8 new this {selectedPeriod}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Quiz Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Performance</CardTitle>
                  <CardDescription>Average scores and completion rates by quiz</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.quizPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="averageScore" fill="#8884d8" name="Average Score %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Student Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Progress</CardTitle>
                  <CardDescription>Active students and quiz completions over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.studentProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="activeStudents" 
                        stroke="#8884d8" 
                        name="Active Students"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completedQuizzes" 
                        stroke="#82ca9d" 
                        name="Completed Quizzes"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                  <CardDescription>Distribution of student scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.scoreDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ range, percentage }) => `${range}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.scoreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Students with highest average scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topPerformers.map((student, index) => (
                      <div key={student.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.quizzesCompleted} quizzes completed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{student.averageScore}%</p>
                          <p className="text-xs text-muted-foreground">avg score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}