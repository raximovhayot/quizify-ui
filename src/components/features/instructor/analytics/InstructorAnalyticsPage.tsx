'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ErrorDisplay } from '@/components/shared/ui/ErrorDisplay';

import { AnalyticsContent } from './components/AnalyticsContent';
import { useAssignments } from './hooks/useAssignments';
import { AssignmentStatus } from './types/assignment';

export function InstructorAnalyticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const safePath = pathname ?? '/instructor/analytics';
  const searchParams = useSearchParams();

  // Extract filter from URL params
  const filter = useMemo(() => {
    const pageParam = searchParams?.get('page');
    const sizeParam = searchParams?.get('size');
    const search = searchParams?.get('search') || undefined;
    const statusParam = searchParams?.get('status') || undefined;

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

  // URL update helper
  const updateUrl = useCallback(
    (params: URLSearchParams, method: 'push' | 'replace' = 'push') => {
      const query = params.toString();
      const url = query ? `${safePath}?${query}` : safePath;
      if (method === 'replace') router.replace(url);
      else router.push(url);
    },
    [safePath, router]
  );

  // Filter handlers
  const onPageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.set('page', Math.max(0, page).toString());
      updateUrl(params, 'push');
    },
    [searchParams, updateUrl]
  );

  const onSearch = useCallback(
    (search: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
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
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (status) params.set('status', String(status));
      else params.delete('status');
      params.set('page', '0');
      updateUrl(params, 'push');
    },
    [searchParams, updateUrl]
  );

  const onPageSizeChange = useCallback(
    (size: number) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.set('size', Math.min(100, Math.max(1, size)).toString());
      params.set('page', '0');
      updateUrl(params, 'push');
    },
    [searchParams, updateUrl]
  );

  // Data fetching
  const { data, isLoading, isFetching, error, refetch } =
    useAssignments(filter);

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorDisplay
          error={error}
          onRetry={() => refetch()}
          title="Failed to load analytics"
          description="Please try again later."
        />
      </div>
    );
  }

  return (
    <AnalyticsContent
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      filter={filter}
      onSearch={onSearch}
      onStatusFilter={onStatusFilter}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}

export default InstructorAnalyticsPage;
