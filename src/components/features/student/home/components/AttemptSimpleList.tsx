import React, { JSX } from 'react';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { AttemptListingData } from '@/components/features/student/quiz/types/attempt';
import { ROUTES_APP } from '@/components/features/student/routes';
import { EmptyState } from '@/components/shared/ui/EmptyState';
import { List, ListItem } from '@/components/atomic/atoms';

interface AttemptSimpleListProps {
  items: AttemptListingData[];
  emptyLabel: string;
  icon?: JSX.Element;
}

/**
 * AttemptSimpleList — renders a simple list of in‑progress attempts for students.
 * Fully typed with `AttemptListingData[]`; no usage of `any`.
 */
export function AttemptSimpleList({ items, emptyLabel, icon }: AttemptSimpleListProps) {
  const t = useTranslations();
  if (!items || items.length === 0) {
    return <EmptyState icon={icon} message={emptyLabel} />;
  }

  return (
    <List>
      {items.map((a) => (
        <ListItem
          key={a.id}
          end={
            <Link
              className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
              href={`${ROUTES_APP.baseUrl()}/attempts/${a.id}`}
              aria-label={t('attempt.open', { fallback: 'Open attempt' })}
            >
              {t('common.open', { fallback: 'Open' })}
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="font-medium line-clamp-1">{a.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {typeof a.attempt === 'number'
              ? t('attempt.number', { number: a.attempt, fallback: `Attempt #${a.attempt}` })
              : null}
            {a.total !== undefined && a.correct !== undefined
              ? ` • ${t('attempt.correctSummary', { correct: a.correct, total: a.total, fallback: `${a.correct}/${a.total} correct` })}`
              : null}
          </div>
        </ListItem>
      ))}
    </List>
  );
}

export default AttemptSimpleList;
