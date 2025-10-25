'use client';

import { format } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';
import { useState, useMemo } from 'react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'student' | 'score' | 'submitted'>(
    'submitted'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  // Filter and sort attempts
  const filteredAndSortedAttempts = useMemo(() => {
    if (!analytics?.attempts) return [];

    let filtered = analytics.attempts;

    // Filter by search query (student name or email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (attempt) =>
          attempt.studentName.toLowerCase().includes(query) ||
          attempt.studentEmail.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((attempt) => attempt.status === statusFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'student':
          comparison = a.studentName.localeCompare(b.studentName);
          break;
        case 'score':
          comparison =
            (a.percentage || 0) - (b.percentage || 0);
          break;
        case 'submitted':
          const aDate = a.submittedAt
            ? new Date(a.submittedAt).getTime()
            : 0;
          const bDate = b.submittedAt
            ? new Date(b.submittedAt).getTime()
            : 0;
          comparison = aDate - bDate;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [analytics?.attempts, searchQuery, statusFilter, sortBy, sortOrder]);

  const toggleSort = (column: 'student' | 'score' | 'submitted') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>
            {t('instructor.assignment.attempts.title', {
              fallback: 'Student Attempts',
            })}{' '}
            {attempts.length > 0 && (
              <span className="text-muted-foreground font-normal">
                ({filteredAndSortedAttempts.length}/{attempts.length})
              </span>
            )}
          </CardTitle>

          {attempts.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder={t('instructor.assignment.attempts.search', {
                  fallback: 'Search students...',
                })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('instructor.assignment.attempts.allStatus', {
                      fallback: 'All Status',
                    })}
                  </SelectItem>
                  <SelectItem value="IN_PROGRESS">
                    {t('instructor.assignment.attempt.status.inProgress', {
                      fallback: 'In Progress',
                    })}
                  </SelectItem>
                  <SelectItem value="SUBMITTED">
                    {t('instructor.assignment.attempt.status.submitted', {
                      fallback: 'Submitted',
                    })}
                  </SelectItem>
                  <SelectItem value="GRADED">
                    {t('instructor.assignment.attempt.status.graded', {
                      fallback: 'Graded',
                    })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredAndSortedAttempts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {attempts.length === 0
              ? t('instructor.assignment.attempts.empty', {
                  fallback: 'No attempts yet',
                })
              : t('instructor.assignment.attempts.noResults', {
                  fallback: 'No attempts match your filters',
                })}
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8"
                      onClick={() => toggleSort('student')}
                    >
                      {t('instructor.assignment.attempts.student', {
                        fallback: 'Student',
                      })}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8"
                      onClick={() => toggleSort('score')}
                    >
                      {t('instructor.assignment.attempts.score', {
                        fallback: 'Score',
                      })}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    {t('instructor.assignment.attempts.percentage', {
                      fallback: '%',
                    })}
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8"
                      onClick={() => toggleSort('submitted')}
                    >
                      {t('instructor.assignment.attempts.submitted', {
                        fallback: 'Submitted',
                      })}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedAttempts.map((attempt) => (
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
