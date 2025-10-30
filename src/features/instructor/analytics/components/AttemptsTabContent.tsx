'use client';

import { format } from 'date-fns';
import { ArrowUpDown, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppPagination } from '@/components/shared/ui/AppPagination';
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

import { useAttempts } from '../hooks';

interface AttemptsTabContentProps {
  assignmentId: number;
}

export function AttemptsTabContent({
  assignmentId,
}: Readonly<AttemptsTabContentProps>) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const urlPageParam = parseInt(searchParams?.get('apage') ?? '1', 10);
  const initialPage = Number.isFinite(urlPageParam) && urlPageParam > 0 ? urlPageParam - 1 : 0;
  const [page, setPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState<'studentName' | 'score' | 'startedAt'>(
    'startedAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const updateSearchParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (value === undefined || value === '' || value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  };

  const setPageAndUrl = (p: number) => {
    setPage(p);
    updateSearchParam('apage', String(p + 1));
  };

  // Memoize filter to prevent unnecessary refetches
  const filter = useMemo(() => ({
    page,
    size: 20,
    status: statusFilter || undefined,
    sort: `${sortBy},${sortOrder}`,
  }), [page, statusFilter, sortBy, sortOrder]);

  const { data, isLoading } = useAttempts(assignmentId, filter);

  // Sync page from URL (back/forward navigation)
  useEffect(() => {
    const ap = parseInt(searchParams?.get('apage') ?? '1', 10);
    const zero = Number.isFinite(ap) && ap > 0 ? ap - 1 : 0;
    setPage((prev) => (prev !== zero ? zero : prev));
  }, [searchParams]);

  // Clamp page to available totalPages when data is available
  useEffect(() => {
    if (!data) return;
    const tp = data.totalPages ?? 1;
    if (tp > 0 && page > tp - 1) {
      const clamped = tp - 1;
      setPage(clamped);
      updateSearchParam('apage', String(clamped + 1));
    }
  }, [data, page]);

  const attempts = useMemo(() => data?.content ?? [], [data?.content]);

  // Client-side filtering by search
  const filteredAttempts = useMemo(() => {
    if (!searchQuery) return attempts;
    const query = searchQuery.toLowerCase();
    return attempts.filter((attempt) =>
      attempt.studentName.toLowerCase().includes(query)
    );
  }, [attempts, searchQuery]);

  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPageAndUrl(0); // Reset to first page
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'PPp');
    } catch {
      return dateString;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusBadge = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'GRADED':
        return (
          <Badge variant="default" className="bg-green-600">
            {t('common.graded', { fallback: 'Graded' })}
          </Badge>
        );
      case 'SUBMITTED':
        return (
          <Badge variant="secondary">
            {t('common.submitted', { fallback: 'Submitted' })}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {t('common.inProgress', { fallback: 'In Progress' })}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>
            {t('instructor.analytics.attempts.title', { fallback: 'Attempts' })} ({data?.totalElements || 0})
          </CardTitle>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('common.searchByStudent', {
                fallback: 'Search by student...',
              })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v === 'ALL' ? '' : v);
              setPageAndUrl(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue
                placeholder={t('common.allStatuses', {
                  fallback: 'All Statuses',
                })}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t('common.allStatuses', { fallback: 'All Statuses' })}
              </SelectItem>
              <SelectItem value="IN_PROGRESS">
                {t('common.inProgress', { fallback: 'In Progress' })}
              </SelectItem>
              <SelectItem value="SUBMITTED">
                {t('common.submitted', { fallback: 'Submitted' })}
              </SelectItem>
              <SelectItem value="GRADED">
                {t('common.graded', { fallback: 'Graded' })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('common.loading', { fallback: 'Loading...' })}
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {attempts.length === 0
              ? t('common.noAttempts', { fallback: 'No attempts yet' })
              : t('common.noResults', { fallback: 'No results found' })}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => toggleSort('studentName')}
                      >
                        {t('common.student', { fallback: 'Student' })}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      {t('common.attempt', { fallback: 'Attempt' })}
                    </TableHead>
                    <TableHead>
                      {t('common.statusLabel', { fallback: 'Status' })}
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => toggleSort('score')}
                      >
                        {t('common.score', { fallback: 'Score' })}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      {t('common.duration', { fallback: 'Duration' })}
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => toggleSort('startedAt')}
                      >
                        {t('common.submitted', { fallback: 'Submitted' })}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttempts.map((attempt) => (
                    <TableRow
                      key={attempt.attemptId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        router.push(
                          `/instructor/analytics/${assignmentId}/attempts/${attempt.attemptId}`
                        )
                      }
                    >
                      <TableCell>
                        <div className="font-medium">{attempt.studentName}</div>
                      </TableCell>
                      <TableCell>{attempt.attemptNumber}</TableCell>
                      <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                      <TableCell>
                        {attempt.score !== null ? attempt.score.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell>{formatDuration(attempt.durationSeconds)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(attempt.completedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <AppPagination
                className="mt-4"
                currentPage={page}
                totalPages={data.totalPages}
                onPageChange={setPageAndUrl}
                showInfo
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
