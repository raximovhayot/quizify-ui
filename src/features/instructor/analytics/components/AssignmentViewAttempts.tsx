'use client';

import { format } from 'date-fns';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useAssignmentAnalytics } from '../hooks';
import { StudentAttempt } from '../types/analytics';

interface AssignmentViewAttemptsProps {
  assignmentId: number;
}

export function AssignmentViewAttempts({
  assignmentId,
}: Readonly<AssignmentViewAttemptsProps>) {
  const t = useTranslations();
  const { data: analytics, isLoading } = useAssignmentAnalytics(assignmentId);

  const getStatusBadge = (status: StudentAttempt['status']) => {
    switch (status) {
      case 'GRADED':
        return (
          <Badge variant="default" className="bg-green-600">
            {t('instructor.assignment.attempt.status.graded', {
              fallback: 'Graded',
            })}
          </Badge>
        );
      case 'SUBMITTED':
        return (
          <Badge variant="secondary">
            {t('instructor.assignment.attempt.status.submitted', {
              fallback: 'Submitted',
            })}
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge variant="outline">
            {t('instructor.assignment.attempt.status.inProgress', {
              fallback: 'In Progress',
            })}
          </Badge>
        );
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'PPp');
    } catch {
      return dateString;
    }
  };

  const formatScore = (score: number | null, maxScore: number) => {
    if (score === null) return '-';
    return `${score}/${maxScore}`;
  };

  const formatPercentage = (percentage: number | null) => {
    if (percentage === null) return '-';
    return `${percentage.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t('instructor.assignment.attempts.title', {
              fallback: 'Student Attempts',
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('instructor.assignment.attempts.loading', {
              fallback: 'Loading attempts...',
            })}
          </p>
        </CardContent>
      </Card>
    );
  }

  const attempts = analytics?.attempts || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('instructor.assignment.attempts.title', {
            fallback: 'Student Attempts',
          })}{' '}
          {attempts.length > 0 && (
            <span className="text-muted-foreground font-normal">
              ({attempts.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attempts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('instructor.assignment.attempts.empty', {
              fallback: 'No attempts yet',
            })}
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t('instructor.assignment.attempts.student', {
                      fallback: 'Student',
                    })}
                  </TableHead>
                  <TableHead>
                    {t('instructor.assignment.attempts.attempt', {
                      fallback: 'Attempt',
                    })}
                  </TableHead>
                  <TableHead>
                    {t('instructor.assignment.attempts.status', {
                      fallback: 'Status',
                    })}
                  </TableHead>
                  <TableHead>
                    {t('instructor.assignment.attempts.score', {
                      fallback: 'Score',
                    })}
                  </TableHead>
                  <TableHead>
                    {t('instructor.assignment.attempts.percentage', {
                      fallback: '%',
                    })}
                  </TableHead>
                  <TableHead>
                    {t('instructor.assignment.attempts.submitted', {
                      fallback: 'Submitted',
                    })}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{attempt.studentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {attempt.studentEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{attempt.attemptNumber}</TableCell>
                    <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                    <TableCell>
                      {formatScore(attempt.score, attempt.maxScore)}
                    </TableCell>
                    <TableCell>{formatPercentage(attempt.percentage)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(attempt.submittedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
