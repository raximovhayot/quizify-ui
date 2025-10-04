'use client';

import { CheckCircle2, Circle, Clock } from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { StudentAttempt } from '../types/analytics';

interface AttemptsTableProps {
  attempts: StudentAttempt[];
  loading?: boolean;
}

export function AttemptsTable({ attempts, loading }: AttemptsTableProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return <AttemptsTableSkeleton />;
  }

  const filteredAttempts = attempts.filter(
    (attempt) =>
      attempt.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '-';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: StudentAttempt['status']) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <Badge variant="outline" className="text-orange-600">
            <Clock className="mr-1 h-3 w-3" />
            {t('instructor.analytics.status.inProgress', {
              fallback: 'In Progress',
            })}
          </Badge>
        );
      case 'SUBMITTED':
        return (
          <Badge variant="outline" className="text-blue-600">
            <Circle className="mr-1 h-3 w-3" />
            {t('instructor.analytics.status.submitted', {
              fallback: 'Submitted',
            })}
          </Badge>
        );
      case 'GRADED':
        return (
          <Badge variant="outline" className="text-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {t('instructor.analytics.status.graded', { fallback: 'Graded' })}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>
            {t('instructor.analytics.studentAttempts', {
              fallback: 'Student Attempts',
            })}
          </CardTitle>
          <Input
            placeholder={t('instructor.analytics.searchStudents', {
              fallback: 'Search students...',
            })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredAttempts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {searchQuery
              ? t('instructor.analytics.noResults', {
                  fallback: 'No students found',
                })
              : t('instructor.analytics.noAttempts', {
                  fallback: 'No attempts yet',
                })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t('instructor.analytics.student', { fallback: 'Student' })}
                  </TableHead>
                  <TableHead>
                    {t('instructor.analytics.attempt', { fallback: 'Attempt' })}
                  </TableHead>
                  <TableHead>
                    {t('instructor.analytics.status', { fallback: 'Status' })}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('instructor.analytics.score', { fallback: 'Score' })}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('instructor.analytics.timeSpent', {
                      fallback: 'Time Spent',
                    })}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('instructor.analytics.submittedAt', {
                      fallback: 'Submitted At',
                    })}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{attempt.studentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {attempt.studentEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>#{attempt.attemptNumber}</TableCell>
                    <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                    <TableCell className="text-right">
                      {attempt.percentage !== null ? (
                        <div>
                          <div className="font-medium">
                            {attempt.percentage.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {attempt.score}/{attempt.maxScore}
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatTime(attempt.timeSpent)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {attempt.submittedAt
                        ? new Date(attempt.submittedAt).toLocaleString()
                        : '-'}
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

function AttemptsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
