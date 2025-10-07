import React, { JSX } from 'react';

import { ArrowRight } from 'lucide-react';

import { AttemptListingData } from '@/components/features/student/quiz/types/attempt';
import { ROUTES_APP } from '@/components/features/student/routes';
import { EmptyState } from '@/components/features/student/home/components/EmptyState';

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
  if (!items || items.length === 0) {
    return <EmptyState icon={icon} message={emptyLabel} />;
  }

  return (
    <ul className="space-y-2">
      {items.map((a) => (
        <li
          key={a.id}
          className="rounded-md border p-4 hover:bg-accent/40 flex items-center justify-between"
        >
          <div className="min-w-0 pr-4">
            <div className="font-medium line-clamp-1">{a.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {typeof a.attempt === 'number' ? `Attempt #${a.attempt}` : null}
              {a.total !== undefined && a.correct !== undefined
                ? ` • ${a.correct}/${a.total} correct`
                : null}
            </div>
          </div>
          <a
            className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
            href={`${ROUTES_APP.baseUrl()}/attempts/${a.id}`}
            aria-label="Open attempt"
          >
            Open
            <ArrowRight className="h-4 w-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export default AttemptSimpleList;
