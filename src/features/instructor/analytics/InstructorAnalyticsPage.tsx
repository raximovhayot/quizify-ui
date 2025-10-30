'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { useUrlFilter } from '@/components/shared/hooks/useUrlFilter';

import { AnalyticsHeader } from './components/AnalyticsHeader';
import { AnalyticsListSection } from './components/AnalyticsListSection';
import { useAssignments } from './hooks';
import { AssignmentFilter, AssignmentStatus } from './types/assignment';

export function InstructorAnalyticsPage() {
  // Memoize parseFilter to prevent unnecessary filter object recreation
  const parseFilter = useCallback((params: URLSearchParams): Partial<AssignmentFilter> => ({
    status: params.get('status') as AssignmentStatus | string | undefined,
  }), []);

  // Use URL-based state management
  const { filter, setPage, setSearch } = useUrlFilter<AssignmentFilter>({
    defaultSize: 10,
    parseFilter,
  });

  // Local state for search input (before debounce)
  const [searchQuery, setSearchQuery] = useState(filter.search || '');

  // Sync searchQuery with URL filter
  useEffect(() => {
    setSearchQuery(filter.search || '');
  }, [filter.search]);

  // Debounce search input
  useEffect(() => {
    const trimmed = (searchQuery || '').trim();
    if (trimmed === (filter.search || '')) return;
    const id = setTimeout(() => {
      setSearch(trimmed);
    }, 400);
    return () => clearTimeout(id);
  }, [searchQuery, filter.search, setSearch]);

  const { data, isLoading } = useAssignments(filter);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = (searchQuery || '').trim();
    setSearch(trimmed);
  };

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      <AnalyticsListSection
        loading={isLoading}
        assignments={data?.content}
        totalElements={data?.totalElements}
        searchQuery={filter.search || ''}
        currentPage={data?.page || 0}
        totalPages={data?.totalPages || 0}
        onPageChange={setPage}
      />
    </div>
  );
}

export default InstructorAnalyticsPage;
