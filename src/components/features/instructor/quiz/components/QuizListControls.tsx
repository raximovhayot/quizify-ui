'use client';

import { memo, useCallback } from 'react';

import { useTranslations } from 'next-intl';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface QuizListControlsProps {
  totalElements: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export const QuizListControls = memo(function QuizListControls({
  totalElements,
  pageSize,
  onPageSizeChange,
  className,
}: QuizListControlsProps) {
  const t = useTranslations();

  const handlePageSizeChange = useCallback(
    (value: string) => {
      onPageSizeChange(parseInt(value, 10));
    },
    [onPageSizeChange]
  );

  const pageSizeOptions = [
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' },
  ];

  return (
    <div className={`flex items-center justify-between ${className || ''}`}>
      <p className="text-sm text-muted-foreground">
        {t('common.pagination.showing', {
          fallback: 'Showing {total} results',
          total: totalElements,
        })}
      </p>
      <div className="flex items-center gap-2">
        <Label htmlFor="page-size" className="text-sm whitespace-nowrap">
          {t('common.pagination.perPage', { fallback: 'Per page' })}:
        </Label>
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger id="page-size" className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});
