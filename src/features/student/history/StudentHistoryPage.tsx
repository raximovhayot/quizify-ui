'use client';

import { useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { AttemptStatus } from '@/features/student/quiz/types/attempt';
import { AppPagination } from '@/components/shared/ui/AppPagination';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getErrorMessage } from '@/lib/api/utils';

import { AttemptList } from './components/AttemptList';
import { HistoryCard } from './components/HistoryCard';
import { StudentHistorySkeleton } from './components/StudentHistorySkeleton';
import {
  AttemptHistoryFilter,
  useAttemptHistory,
} from './hooks/useAttemptHistory';

export function StudentHistoryPage() {
  const t = useTranslations();

  const [status, setStatus] = useState<AttemptHistoryFilter['status']>('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const filter: AttemptHistoryFilter = useMemo(
    () => ({ status, page, size }),
    [status, page, size]
  );

  const historyQuery = useAttemptHistory(filter);

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('common.all', { fallback: 'All' }) },
      {
        value: AttemptStatus.CREATED,
        label: t('student.history.status.created', { fallback: 'Created' }),
      },
      {
        value: AttemptStatus.STARTED,
        label: t('student.history.status.started', { fallback: 'Started' }),
      },
      {
        value: AttemptStatus.FINISHED,
        label: t('student.history.status.finished', { fallback: 'Finished' }),
      },
    ],
    [t]
  );

  return (
    <HistoryCard
      title={t('student.history.title', { fallback: 'Attempt history' })}
      isLoading={historyQuery.isLoading}
      error={
        historyQuery.isError
          ? `${t('student.history.loadError', { fallback: 'Failed to load history' })}: ${getErrorMessage(historyQuery.error)}`
          : undefined
      }
      actions={
        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter" className="whitespace-nowrap text-sm">
            {t('common.status', { fallback: 'Status' })}:
          </Label>
          <Select
            value={status === '' ? 'all' : status}
            onValueChange={(v) => {
              setPage(0);
              setStatus(v === 'all' ? '' : (v as AttemptStatus));
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
            emptyLabel={t('student.history.empty', {
              fallback: 'No attempts yet',
            })}
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
