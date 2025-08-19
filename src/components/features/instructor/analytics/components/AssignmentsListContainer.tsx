'use client';

import { useCallback, useMemo } from 'react';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ErrorDisplay } from '@/components/shared/ui/ErrorDisplay';

import { useAssignments } from '../hooks/useAssignments';
import { AssignmentStatus } from '../types/assignment';
import { AssignmentsList } from './AssignmentsList';

export interface AssignmentsListContainerProps {
  className?: string;
}

export function AssignmentsListContainer({
  className,
}: AssignmentsListContainerProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filter = useMemo(() => {
    const pageParam = searchParams.get('page');
    const sizeParam = searchParams.get('size');
    const search = searchParams.get('search') || undefined;
    const statusParam = searchParams.get('status') || undefined;

    const page = pageParam ? Math.max(0, parseInt(pageParam, 10) || 0) : 0;
    const size = sizeParam
      ? Math.min(100, Math.max(1, parseInt(sizeParam, 10) || 10))
      : 10;

    return {
      page,
      size,
      search,
      status: statusParam as AssignmentStatus | string | undefined,
    };
  }, [searchParams]);

  const updateUrl = useCallback(
    (params: URLSearchParams, method: 'push' | 'replace' = 'push') => {
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      if (method === 'replace') router.replace(url);
      else router.push(url);
    },
    [pathname, router]
  );

  const onPageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', Math.max(0, page).toString());
      updateUrl(params, 'push');
    },
    [searchParams, updateUrl]
  );

  const onSearch = useCallback(
    (search: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const value = (search || '').trim();
      if (value) params.set('search', value);
      else params.delete('search');
      params.set('page', '0');
      updateUrl(params, 'push');
    },
    [searchParams, updateUrl]
  );

  const onStatusFilter = useCallback(
    (status: AssignmentStatus | string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (status) params.set('status', String(status));
      else params.delete('status');
      params.set('page', '0');
      updateUrl(params, 'push');
    },
    [searchParams, updateUrl]
  );

  const onPageSizeChange = useCallback(
    (size: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('size', Math.min(100, Math.max(1, size)).toString());
      params.set('page', '0');
      updateUrl(params, 'push');
    },
    [searchParams, updateUrl]
  );

  const { data, isLoading, isFetching, error, refetch } =
    useAssignments(filter);

  if (isLoading || (isFetching && !data)) {
    return (
      <div className={`p-6 ${className || ''}`}>
        {t('common.loading', { fallback: 'Loading...' })}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className || ''}`}>
        <ErrorDisplay
          error={error}
          onRetry={() => refetch()}
          title={t('instructor.analytics.assignments.error.title', {
            fallback: 'Failed to load assignments',
          })}
          description={t('instructor.analytics.assignments.error.description', {
            fallback: 'Please try again.',
          })}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`p-6 ${className || ''}`}>
        <p className="text-muted-foreground">
          {t('instructor.analytics.assignments.no.data', {
            fallback: 'No data',
          })}
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className || ''}`}>
      <AssignmentsList
        items={data.content}
        totalElements={data.totalElements}
        totalPages={data.totalPages}
        currentPage={data.page}
        pageSize={data.size}
        filter={{ search: filter.search, status: filter.status }}
        onSearch={onSearch}
        onStatusFilter={onStatusFilter}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
