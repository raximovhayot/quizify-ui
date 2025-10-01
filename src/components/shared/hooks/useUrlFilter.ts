import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface BaseFilter {
  page?: number;
  size?: number;
  search?: string;
  [key: string]: unknown;
}

export interface UseUrlFilterOptions<T extends BaseFilter> {
  defaultPage?: number;
  defaultSize?: number;
  parseFilter?: (searchParams: URLSearchParams) => Partial<T>;
}

export interface UseUrlFilterReturn<T extends BaseFilter> {
  filter: T;
  updateFilter: (updates: Partial<T>) => void;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;
}

/**
 * Hook for managing URL-based filters with pagination
 *
 * Provides a consistent way to manage filter state in URL params across
 * different pages. Keeps filter state synchronized with URL for better UX
 * (shareable URLs, back button support).
 *
 * @example
 * ```tsx
 * const { filter, setPage, setSearch, setSize } = useUrlFilter<QuizFilter>({
 *   defaultSize: 10,
 *   parseFilter: (params) => ({
 *     status: params.get('status') as QuizStatus | undefined,
 *   }),
 * });
 * ```
 */
export function useUrlFilter<T extends BaseFilter>({
  defaultPage = 0,
  defaultSize = 10,
  parseFilter,
}: UseUrlFilterOptions<T> = {}): UseUrlFilterReturn<T> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse filter from URL
  const filter = useMemo(() => {
    const pageParam = searchParams?.get('page');
    const sizeParam = searchParams?.get('size');
    const search = searchParams?.get('search') || undefined;

    const page = pageParam
      ? Math.max(0, parseInt(pageParam, 10) || 0)
      : defaultPage;
    const size = sizeParam
      ? Math.min(100, Math.max(1, parseInt(sizeParam, 10) || defaultSize))
      : defaultSize;

    const baseFilter: BaseFilter = {
      page,
      size,
      search,
    };

    // Parse additional filters if provided
    const additionalFilters = parseFilter
      ? parseFilter(searchParams || new URLSearchParams())
      : {};

    return {
      ...baseFilter,
      ...additionalFilters,
    } as T;
  }, [searchParams, defaultPage, defaultSize, parseFilter]);

  // Update URL with new params
  const updateUrl = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      router.push(url);
    },
    [pathname, router]
  );

  // Generic update filter
  const updateFilter = useCallback(
    (updates: Partial<T>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');

      // Apply updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      updateUrl(params);
    },
    [searchParams, updateUrl]
  );

  // Convenience methods
  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.set('page', Math.max(0, page).toString());
      updateUrl(params);
    },
    [searchParams, updateUrl]
  );

  const setSize = useCallback(
    (size: number) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.set('size', Math.min(100, Math.max(1, size)).toString());
      params.set('page', '0'); // Reset to first page when changing size
      updateUrl(params);
    },
    [searchParams, updateUrl]
  );

  const setSearch = useCallback(
    (search: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      const value = (search || '').trim();
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      params.set('page', '0'); // Reset to first page when searching
      updateUrl(params);
    },
    [searchParams, updateUrl]
  );

  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  return {
    filter,
    updateFilter,
    setPage,
    setSize,
    setSearch,
    resetFilters,
  };
}
