'use client';

import { useTranslations } from 'next-intl';

import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function AssignmentsTableHeader() {
  const t = useTranslations();

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[40%]">
          {t('instructor.analytics.table.title', { fallback: 'Title' })}
        </TableHead>
        <TableHead className="w-[15%]">
          {t('common.status', { fallback: 'Status' })}
        </TableHead>
        <TableHead className="w-[15%]">
          {t('instructor.analytics.table.created', { fallback: 'Created' })}
        </TableHead>
        <TableHead className="w-[15%]">
          {t('instructor.analytics.table.due', { fallback: 'Due Date' })}
        </TableHead>
        <TableHead className="w-[15%] text-right">
          {t('common.actions', { fallback: 'Actions' })}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
