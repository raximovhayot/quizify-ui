'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Eye,
  TrendingUp
} from 'lucide-react';

interface AttemptActivity {
  id: string;
  studentName: string;
  studentId: string;
  quizTitle: string;
  quizId: string;
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
  startTime: string;
  currentQuestion?: number;
  totalQuestions: number;
  score?: number;
  timeElapsed: number;
  lastActivity: string;
}

interface RealTimeStats {
  activeAttempts: number;
  completedToday: number;
  averageScore: number;
  totalStudentsOnline: number;
}

interface RealTimeMonitorProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  maxActivities?: number;
}

export function RealTimeMonitor({
  className,
  autoRefresh = true,
  refreshInterval = 5000,
  maxActivities = 10,
}: RealTimeMonitorProps) {
  const [activities, setActivities] = useState<AttemptActivity[]>([]);
  const [stats, setStats] = useState<RealTimeStats>({
    activeAttempts: 0,
    completedToday: 0,
    averageScore: 0,
    totalStudentsOnline: 0,
  });
  const [isMonitoring, setIsMonitoring] = useState(autoRefresh);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock data generator for demonstration
  const generateMockActivity = (): AttemptActivity => {
    const students = [
      'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown',
      'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'Jack Anderson'
    ];
    const quizzes = [
      'Mathematics Quiz #1', 'Physics Quiz #2', 'Chemistry Quiz #1', 
      'Biology Quiz #3', 'History Quiz #1', 'English Quiz #2'
    ];
    const statuses: AttemptActivity['status'][] = ['started', 'in_progress', 'completed', 'abandoned'];
    
    const student = students[Math.floor(Math.random() * students.length)];
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const totalQuestions = Math.floor(Math.random() * 20) + 5;
    const currentQuestion = status === 'in_progress' ? Math.floor(Math.random() * totalQuestions) + 1 : undefined;
    const timeElapsed = Math.floor(Math.random() * 3600); // up to 1 hour
    
    return {
      id: `${Date.now()}-${Math.random()}`,
      studentName: student,
      studentId: `student-${Math.floor(Math.random() * 1000)}`,
      quizTitle: quiz,
      quizId: `quiz-${Math.floor(Math.random() * 100)}`,
      status,
      startTime: new Date(Date.now() - timeElapsed * 1000).toISOString(),
      currentQuestion,
      totalQuestions,
      score: status === 'completed' ? Math.floor(Math.random() * 100) : undefined,
      timeElapsed,
      lastActivity: new Date().toISOString(),
    };
  };

  const fetchRealTimeData = async () => {
    try {
      // TODO: Replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate new activities
      const shouldAddActivity = Math.random() < 0.3; // 30% chance of new activity
      if (shouldAddActivity) {
        const newActivity = generateMockActivity();
        setActivities(prev => [newActivity, ...prev.slice(0, maxActivities - 1)]);
      }

      // Update existing activities (simulate progress)
      setActivities(prev => prev.map(activity => {
        if (activity.status === 'in_progress' && Math.random() < 0.4) {
          const newCurrentQuestion = Math.min(
            (activity.currentQuestion || 1) + 1,
            activity.totalQuestions
          );
          const newStatus = newCurrentQuestion >= activity.totalQuestions ? 'completed' : 'in_progress';
          
          return {
            ...activity,
            currentQuestion: newCurrentQuestion,
            status: newStatus,
            score: newStatus === 'completed' ? Math.floor(Math.random() * 100) : undefined,
            timeElapsed: activity.timeElapsed + Math.floor(Math.random() * 60),
            lastActivity: new Date().toISOString(),
          };
        }
        return activity;
      }));

      // Update stats
      setStats({
        activeAttempts: Math.floor(Math.random() * 15) + 5,
        completedToday: Math.floor(Math.random() * 50) + 20,
        averageScore: Math.floor(Math.random() * 30) + 70,
        totalStudentsOnline: Math.floor(Math.random() * 25) + 10,
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  useEffect(() => {
    // Initial load
    fetchRealTimeData();

    if (isMonitoring) {
      intervalRef.current = setInterval(fetchRealTimeData, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring, refreshInterval]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const manualRefresh = () => {
    fetchRealTimeData();
  };

  const getStatusIcon = (status: AttemptActivity['status']) => {
    switch (status) {
      case 'started':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'in_progress':
        return <Activity className="w-4 h-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'abandoned':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: AttemptActivity['status']) => {
    const variants = {
      started: 'default',
      in_progress: 'secondary',
      completed: 'default',
      abandoned: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatTimeElapsed = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Real-Time Monitor</h2>
          <p className="text-muted-foreground">
            Live quiz attempts and student activity
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={manualRefresh}
            disabled={isMonitoring}
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isMonitoring && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            variant={isMonitoring ? 'default' : 'outline'}
            size="sm"
            onClick={toggleMonitoring}
          >
            {isMonitoring ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Attempts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Students currently taking quizzes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              Quiz attempts finished today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Today&apos;s average performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Online</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudentsOnline}</div>
            <p className="text-xs text-muted-foreground">
              Currently active students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Live Activity Feed</span>
              </CardTitle>
              <CardDescription>
                Real-time quiz attempts and student progress
              </CardDescription>
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-xs">Quiz attempts will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(activity.status)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium truncate">
                          {activity.studentName}
                        </p>
                        {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.quizTitle}
                      </p>
                      {activity.status === 'in_progress' && activity.currentQuestion && (
                        <p className="text-xs text-muted-foreground">
                          Question {activity.currentQuestion} of {activity.totalQuestions}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{formatTimeElapsed(activity.timeElapsed)}</p>
                    {activity.score !== undefined && (
                      <p className="font-medium text-foreground">{activity.score}%</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}