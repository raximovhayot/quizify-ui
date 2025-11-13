'use client';

import React from 'react';
import { useAssignmentAttempts } from '@/lib/api/hooks/attempts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Download, 
  Users, 
  Award, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AssignmentAnalyticsProps {
  assignmentId: number;
  onExportCSV?: (assignmentId: number) => void;
}

const COLORS = {
  excellent: '#10b981', // green-500
  good: '#3b82f6',      // blue-500
  average: '#f59e0b',   // amber-500
  poor: '#ef4444',      // red-500
};

/**
 * AssignmentAnalytics component for instructors to view assignment statistics
 * Features:
 * - Average score
 * - Completion rate
 * - Score distribution chart
 * - Time statistics
 * - Export to CSV
 */
export function AssignmentAnalytics({ 
  assignmentId,
  onExportCSV 
}: AssignmentAnalyticsProps) {
  const { data: response, isLoading } = useAssignmentAttempts(assignmentId);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const attempts = response?.content || [];
  
  if (attempts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No attempts yet. Analytics will appear once students start taking the quiz.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const completedAttempts = attempts.filter(a => a.status === 'SUBMITTED' || a.status === 'GRADED');
  const totalAttempts = attempts.length;
  const completionRate = totalAttempts > 0 ? (completedAttempts.length / totalAttempts) * 100 : 0;
  
  const scores = completedAttempts
    .filter(a => a.score !== undefined && a.score !== null)
    .map(a => a.score!);
  
  const averageScore = scores.length > 0 
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
    : 0;
  
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

  // Time statistics
  const timesSpent = completedAttempts
    .filter(a => a.timeSpent !== undefined && a.timeSpent !== null)
    .map(a => a.timeSpent!);
  
  const averageTime = timesSpent.length > 0
    ? timesSpent.reduce((sum, time) => sum + time, 0) / timesSpent.length
    : 0;

  // Score distribution (group by ranges)
  const scoreRanges = {
    excellent: scores.filter(s => s >= 90).length,
    good: scores.filter(s => s >= 70 && s < 90).length,
    average: scores.filter(s => s >= 50 && s < 70).length,
    poor: scores.filter(s => s < 50).length,
  };

  const distributionData = [
    { name: '90-100% (Excellent)', value: scoreRanges.excellent, color: COLORS.excellent },
    { name: '70-89% (Good)', value: scoreRanges.good, color: COLORS.good },
    { name: '50-69% (Average)', value: scoreRanges.average, color: COLORS.average },
    { name: '0-49% (Poor)', value: scoreRanges.poor, color: COLORS.poor },
  ].filter(item => item.value > 0);

  // Individual score data for bar chart
  const scoreData = completedAttempts
    .filter(a => a.score !== undefined)
    .map((a, index) => ({
      name: `Student ${a.studentId}`,
      score: a.score,
      id: a.id,
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 10); // Top 10 for readability

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Assignment performance overview
          </p>
        </div>
        {onExportCSV && (
          <Button onClick={() => onExportCSV(assignmentId)} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttempts}</div>
            <p className="text-xs text-muted-foreground">
              {completedAttempts.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Range: {lowestScore}% - {highestScore}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {completedAttempts.length} of {totalAttempts} attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(averageTime / 60)}:{(averageTime % 60).toString().padStart(2, '0')}
            </div>
            <p className="text-xs text-muted-foreground">
              Minutes:Seconds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Score Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>
              Student performance breakdown by grade ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>
              Highest scoring students (top 10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={12}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Passing Rate (≥70%)</span>
                </div>
                <span className="text-lg font-bold">
                  {scores.length > 0 
                    ? ((scores.filter(s => s >= 70).length / scores.length) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Failing Rate (&lt;70%)</span>
                </div>
                <span className="text-lg font-bold">
                  {scores.length > 0 
                    ? ((scores.filter(s => s < 70).length / scores.length) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Perfect Scores (100%)</span>
                </div>
                <span className="text-lg font-bold">
                  {scores.filter(s => s === 100).length}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Highest Score</span>
                </div>
                <span className="text-lg font-bold">{highestScore}%</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600 rotate-180" />
                  <span className="font-medium">Lowest Score</span>
                </div>
                <span className="text-lg font-bold">{lowestScore}%</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Fastest Completion</span>
                </div>
                <span className="text-lg font-bold">
                  {timesSpent.length > 0 
                    ? `${Math.floor(Math.min(...timesSpent) / 60)}:${(Math.min(...timesSpent) % 60).toString().padStart(2, '0')}`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
