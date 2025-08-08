'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

export interface QuizPaginationProps {
  currentPage: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

export function QuizPagination({
  currentPage,
  totalPages,
  isFirst,
  isLast,
  onPageChange,
  className,
}: QuizPaginationProps) {
  const t = useTranslations();

  // Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];

    // Calculate start and end of the range
    const start = Math.max(0, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    // Add first page if not in range
    if (start > 0) {
      range.push(0);
      if (start > 1) {
        range.push(-1); // -1 represents dots
      }
    }

    // Add pages in range
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Add last page if not in range
    if (end < totalPages - 1) {
      if (end < totalPages - 2) {
        range.push(-1); // -1 represents dots
      }
      range.push(totalPages - 1);
    }

    return range;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-center space-x-2 ${className || ''}`}
    >
      {/* First page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(0)}
        disabled={isFirst}
        className="h-8 w-8 p-0"
        aria-label={t('common.pagination.first', {
          fallback: 'Go to first page',
        })}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      {/* Previous page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        className="h-8 w-8 p-0"
        aria-label={t('common.pagination.previous', {
          fallback: 'Go to previous page',
        })}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page numbers */}
      {visiblePages.map((page, index) => {
        if (page === -1) {
          return (
            <span
              key={`dots-${index}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
            >
              ...
            </span>
          );
        }

        const isCurrentPage = page === currentPage;
        return (
          <Button
            key={page}
            variant={isCurrentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            className="h-8 w-8 p-0"
            aria-label={
              isCurrentPage
                ? t('common.pagination.current', {
                    fallback: 'Page {page}, current page',
                    page: page + 1,
                  })
                : t('common.pagination.goto', {
                    fallback: 'Go to page {page}',
                    page: page + 1,
                  })
            }
            aria-current={isCurrentPage ? 'page' : undefined}
          >
            {page + 1}
          </Button>
        );
      })}

      {/* Next page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        className="h-8 w-8 p-0"
        aria-label={t('common.pagination.next', {
          fallback: 'Go to next page',
        })}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages - 1)}
        disabled={isLast}
        className="h-8 w-8 p-0"
        aria-label={t('common.pagination.last', {
          fallback: 'Go to last page',
        })}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>

      {/* Page info */}
      <span className="text-sm text-muted-foreground ml-4">
        {t('common.pagination.info', {
          fallback: 'Page {current} of {total}',
          current: currentPage + 1,
          total: totalPages,
        })}
      </span>
    </div>
  );
}
