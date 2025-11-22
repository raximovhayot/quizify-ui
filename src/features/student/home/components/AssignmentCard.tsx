'use client';

import React, { useMemo } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';
import { formatDistanceToNow, isPast, isFuture, isWithinInterval } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AssignmentCardProps {
  assignment: {
    id: number;
    quizTitle: string;
    startTime: string;
    endTime: string;
    status: 'PUBLISHED' | 'STARTED' | 'FINISHED';
    attemptCount?: number;
    maxAttempts?: number;
  };
  onStart: (assignmentId: number) => void;
  className?: string;
}

type AssignmentCardStatus = 'upcoming' | 'active' | 'completed' | 'expired';

/**
 * AssignmentCard component displays assignment information for students
 * Features:
 * - Time remaining display
 * - Status indicators (upcoming/active/completed/expired)
 * - Start button (enabled only when active)
 * - Quiz details
 */
export function AssignmentCard({ assignment, onStart, className }: AssignmentCardProps) {
  const now = new Date();
  const startTime = new Date(assignment.startTime);
  const endTime = new Date(assignment.endTime);

  // Determine card status
  const cardStatus: AssignmentCardStatus = useMemo(() => {
    if (isPast(endTime)) return 'expired';
    if (assignment.status === 'FINISHED') return 'completed';
    if (isWithinInterval(now, { start: startTime, end: endTime })) return 'active';
    if (isFuture(startTime)) return 'upcoming';
    return 'expired';
  }, [now, startTime, endTime, assignment.status]);

  // Calculate time remaining or time until start
  const timeDisplay = useMemo(() => {
    if (cardStatus === 'upcoming') {
      return `Starts ${formatDistanceToNow(startTime, { addSuffix: true })}`;
    }
    if (cardStatus === 'active') {
      return `Ends ${formatDistanceToNow(endTime, { addSuffix: true })}`;
    }
    if (cardStatus === 'completed') {
      return 'Completed';
    }
    return 'Expired';
  }, [cardStatus, startTime, endTime]);

  // Status badge configuration
  const statusConfig = {
    upcoming: {
      label: 'Upcoming',
      icon: Calendar,
      variant: 'secondary' as const,
      color: 'text-blue-600 dark:text-blue-400',
    },
    active: {
      label: 'Active',
      icon: PlayCircle,
      variant: 'default' as const,
      color: 'text-green-600 dark:text-green-400',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      variant: 'outline' as const,
      color: 'text-gray-600 dark:text-gray-400',
    },
    expired: {
      label: 'Expired',
      icon: AlertCircle,
      variant: 'destructive' as const,
      color: 'text-destructive',
    },
  };

  const config = statusConfig[cardStatus];
  const StatusIcon = config.icon;

  const canStart = cardStatus === 'active' && 
    (!assignment.maxAttempts || !assignment.attemptCount || assignment.attemptCount < assignment.maxAttempts);

  const handleStart = () => {
    if (canStart) {
      onStart(assignment.id);
    }
  };

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold line-clamp-2">{assignment.quizTitle}</h3>
          <Badge variant={config.variant} className="shrink-0">
            <StatusIcon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Time Display */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className={cn('h-4 w-4', config.color)} />
          <span className={config.color}>{timeDisplay}</span>
        </div>

        {/* Date Range */}
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(assignment.startTime).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="ml-6">
              to{' '}
              {new Date(assignment.endTime).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Attempts Info */}
        {assignment.maxAttempts && assignment.maxAttempts > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Attempts: {assignment.attemptCount || 0} / {assignment.maxAttempts}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handleStart} 
          disabled={!canStart}
          className="w-full"
        >
          {cardStatus === 'upcoming' && 'Not Started Yet'}
          {cardStatus === 'active' && (canStart ? 'Start Quiz' : 'No Attempts Remaining')}
          {cardStatus === 'completed' && 'View Results'}
          {cardStatus === 'expired' && 'Quiz Expired'}
        </Button>
      </CardFooter>
    </Card>
  );
}
