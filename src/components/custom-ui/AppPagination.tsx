'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { useMemo } from 'react';

import { useTranslations } from 'next-intl';

import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  Pagination as ShadcnPagination,
} from '@/components/ui/pagination';

export interface AppPaginationProps {
  currentPage: number; // zero-based
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean; // show "Page X of Y"
  siblingCount?: number; // pages shown on each side
  showFirstLast?: boolean;
  showPrevNext?: boolean;
}

export function AppPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showInfo = true,
  siblingCount = 2,
  showFirstLast = true,
  showPrevNext = true,
}: AppPaginationProps) {
  const t = useTranslations();

  const isFirst = currentPage <= 0;
  const isLast = totalPages === 0 || currentPage >= totalPages - 1;

  const visiblePages = useMemo(() => {
    if (totalPages <= 0) return [] as number[];

    const delta = Math.max(0, Math.floor(siblingCount));
    const range: number[] = [];
    const start = Math.max(0, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    if (start > 0) {
      range.push(0);
      if (start > 1) range.push(-1);
    }
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    if (end < totalPages - 1) {
      if (end < totalPages - 2) range.push(-1);
      range.push(totalPages - 1);
    }

    return range;
  }, [currentPage, totalPages, siblingCount]);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between ${className || ''}`}>
      <ShadcnPagination>
        <PaginationContent>
          {showFirstLast && (
            <PaginationItem>
              <PaginationLink
                href="#"
                aria-label={t('common.pagination.first', {
                  fallback: 'Go to first page',
                })}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isFirst) onPageChange(0);
                }}
                className={isFirst ? 'pointer-events-none opacity-50' : ''}
              >
                <ChevronsLeft className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>
          )}

          {showPrevNext && (
            <PaginationItem>
              <PaginationLink
                href="#"
                aria-label={t('common.pagination.previous', {
                  fallback: 'Go to previous page',
                })}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isFirst) onPageChange(currentPage - 1);
                }}
                className={isFirst ? 'pointer-events-none opacity-50' : ''}
              >
                <ChevronLeft className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>
          )}

          {visiblePages.map((page, index) => (
            <PaginationItem key={`p-${index}-${page}`}>
              {page === -1 ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  aria-current={page === currentPage ? 'page' : undefined}
                  aria-label={
                    page === currentPage
                      ? t('common.pagination.current', {
                          fallback: 'Page {page}, current page',
                          page: page + 1,
                        })
                      : t('common.pagination.goto', {
                          fallback: 'Go to page {page}',
                          page: page + 1,
                        })
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                >
                  {page + 1}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {showPrevNext && (
            <PaginationItem>
              <PaginationLink
                href="#"
                aria-label={t('common.pagination.next', {
                  fallback: 'Go to next page',
                })}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isLast) onPageChange(currentPage + 1);
                }}
                className={isLast ? 'pointer-events-none opacity-50' : ''}
              >
                <ChevronRight className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>
          )}

          {showFirstLast && (
            <PaginationItem>
              <PaginationLink
                href="#"
                aria-label={t('common.pagination.last', {
                  fallback: 'Go to last page',
                })}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isLast) onPageChange(totalPages - 1);
                }}
                className={isLast ? 'pointer-events-none opacity-50' : ''}
              >
                <ChevronsRight className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>
          )}
        </PaginationContent>
      </ShadcnPagination>

      {showInfo && (
        <span className="text-sm text-muted-foreground ml-4">
          {t('common.pagination.info', {
            fallback: 'Page {current} of {total}',
            current: currentPage + 1,
            total: totalPages,
          })}
        </span>
      )}
    </div>
  );
}

export default AppPagination;
