"use client";

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { HistoryCard } from './components/HistoryCard';
import { AttemptList } from './components/AttemptList';
import { StudentHistorySkeleton } from './components/StudentHistorySkeleton';
import { useAttemptHistory, AttemptHistoryFilter } from './hooks/useAttemptHistory';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppPagination } from '@/components/shared/ui/AppPagination';

export function StudentHistoryPage() {
  const t = useTranslations();

  const [status, setStatus] = useState<AttemptHistoryFilter['status']>('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const filter: AttemptHistoryFilter = useMemo(() => ({ status, page, size }), [status, page, size]);

  const historyQuery = useAttemptHistory(filter);

  const statusOptions = useMemo(
    () => [
      { value: '', label: t('common.all', { fallback: 'All' }) },
      { value: 'in_progress', label: t('student.history.status.in_progress', { fallback: 'In progress' }) },
      { value: 'completed', label: t('student.history.status.completed', { fallback: 'Completed' }) },
      { value: 'passed', label: t('student.history.status.passed', { fallback: 'Passed' }) },
      { value: 'failed', label: t('student.history.status.failed', { fallback: 'Failed' }) },
    ],
    [t]
  );

  return (
    <HistoryCard
      title={t('student.history.title', { fallback: 'Attempt history' })}
      isLoading={historyQuery.isLoading}
      error={historyQuery.isError ? t('student.history.loadError', { fallback: 'Failed to load history' }) : undefined}
      actions={
        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter" className="whitespace-nowrap text-sm">
            {t('common.status', { fallback: 'Status' })}:
          </Label>
          <Select
            value={status || ''}
            onValueChange={(v) => {
              setPage(0);
              setStatus((v as AttemptHistoryFilter['status']) || '');
            }}
          >
            <SelectTrigger id="status-filter" className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      {historyQuery.isLoading ? (
        <StudentHistorySkeleton />
      ) : (
        <div className="space-y-3">
          <AttemptList
            items={historyQuery.data?.content || []}
            emptyLabel={t('student.history.empty', { fallback: 'No attempts yet' })}
          />
          <AppPagination
            currentPage={historyQuery.data?.page || 0}
            totalPages={historyQuery.data?.totalPages || 0}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </HistoryCard>
  );
}
