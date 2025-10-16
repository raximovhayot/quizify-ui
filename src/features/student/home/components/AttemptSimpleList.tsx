import React, { JSX } from 'react';

import { ArrowRight, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { AttemptListingData } from '@/features/student/quiz/types/attempt';
import { ROUTES_APP } from '@/features/student/routes';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item';

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
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">{icon ?? <FileQuestion className="size-6" />}</EmptyMedia>
          <EmptyTitle>{emptyLabel}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ItemGroup>
      {items.map((a) => (
        <Item key={a.id} variant="outline">
          <ItemContent>
            <ItemTitle className="font-medium line-clamp-1">{a.title}</ItemTitle>
            <div className="text-xs text-muted-foreground mt-0.5">
              {typeof a.attempt === 'number'
                ? t('attempt.number', { number: a.attempt, fallback: `Attempt #${a.attempt}` })
                : null}
              {a.total !== undefined && a.correct !== undefined
                ? ` • ${t('attempt.correctSummary', { correct: a.correct, total: a.total, fallback: `${a.correct}/${a.total} correct` })}`
                : null}
            </div>
          </ItemContent>
          <ItemActions>
            <Link
              className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
              href={`${ROUTES_APP.baseUrl()}/attempts/${a.id}`}
              aria-label={t('attempt.open', { fallback: 'Open attempt' })}
            >
              {t('common.open', { fallback: 'Open' })}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}

export default AttemptSimpleList;
