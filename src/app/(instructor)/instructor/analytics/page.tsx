'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  Download,
  Calendar
} from 'lucide-react';

export default function AnalyticsPage() {
  const t = useTranslations();
  const [timeRange, setTimeRange] = useState('30d');

  // Mock data - in real implementation, this would come from API calls
  const overallStats = {
    totalStudents: 45,
    activeAssignments: 8,
    completedQuizzes: 156,
    averageScore: 78.5,
    trends: {
      students: 12,
      assignments: -2,
      quizzes: 23,
      score: 3.2
    }
  };

  const quizPerformance = [
    { name: 'JavaScript Fundamentals', attempts: 45, avgScore: 82, passRate: 89 },
    { name: 'React Components', attempts: 38, avgScore: 75, passRate: 76 },
    { name: 'TypeScript Basics', attempts: 42, avgScore: 79, passRate: 83 },
    { name: 'Node.js Backend', attempts: 35, avgScore: 71, passRate: 69 }
  ];

  const studentProgress = [
    { name: 'Week 1', completed: 42, total: 45 },
    { name: 'Week 2', completed: 39, total: 45 },
    { name: 'Week 3', completed: 41, total: 45 },
    { name: 'Week 4', completed: 38, total: 45 }
  ];

  const topPerformers = [
    { name: 'Alice Johnson', score: 95, quizzes: 12 },
    { name: 'Bob Smith', score: 92, quizzes: 11 },
    { name: 'Carol Davis', score: 89, quizzes: 12 },
    { name: 'David Wilson', score: 87, quizzes: 10 },
    { name: 'Eva Brown', score: 85, quizzes: 12 }
  ];

  const strugglingStudents = [
    { name: 'Frank Miller', score: 45, quizzes: 8, lastActive: '3 days ago' },
    { name: 'Grace Lee', score: 52, quizzes: 6, lastActive: '1 week ago' },
    { name: 'Henry Taylor', score: 48, quizzes: 7, lastActive: '2 days ago' }
  ];

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <div className="h-4 w-4" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('navigation.analytics')}
          </h1>
          <p className="text-muted-foreground">
            Track student performance and course analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalStudents}</div>
            <p className={`text-xs flex items-center gap-1 ${getTrendColor(overallStats.trends.students)}`}>
              {getTrendIcon(overallStats.trends.students)}
              {Math.abs(overallStats.trends.students)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.activeAssignments}</div>
            <p className={`text-xs flex items-center gap-1 ${getTrendColor(overallStats.trends.assignments)}`}>
              {getTrendIcon(overallStats.trends.assignments)}
              {Math.abs(overallStats.trends.assignments)} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Completions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.completedQuizzes}</div>
            <p className={`text-xs flex items-center gap-1 ${getTrendColor(overallStats.trends.quizzes)}`}>
              {getTrendIcon(overallStats.trends.quizzes)}
              {Math.abs(overallStats.trends.quizzes)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.averageScore}%</div>
            <p className={`text-xs flex items-center gap-1 ${getTrendColor(overallStats.trends.score)}`}>
              {getTrendIcon(overallStats.trends.score)}
              {Math.abs(overallStats.trends.score)}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quiz Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quiz Performance
            </CardTitle>
            <CardDescription>
              Performance metrics for each quiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quizPerformance.map((quiz, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{quiz.name}</h4>
                    <span className="text-sm text-muted-foreground">
                      {quiz.attempts} attempts
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Avg Score: </span>
                      <span className="font-medium">{quiz.avgScore}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pass Rate: </span>
                      <span className="font-medium">{quiz.passRate}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${quiz.passRate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Progress
            </CardTitle>
            <CardDescription>
              Assignment completion rates by week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentProgress.map((week, index) => {
                const completionRate = Math.round((week.completed / week.total) * 100);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{week.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        {week.completed}/{week.total} completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full flex items-center justify-end pr-2" 
                        style={{ width: `${completionRate}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Top Performers
            </CardTitle>
            <CardDescription>
              Students with highest average scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.quizzes} quizzes completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{student.score}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Students Needing Help */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Students Needing Help
            </CardTitle>
            <CardDescription>
              Students with low scores or inactive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strugglingStudents.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.quizzes} quizzes • Last active: {student.lastActive}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{student.score}%</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Send Encouragement Messages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}