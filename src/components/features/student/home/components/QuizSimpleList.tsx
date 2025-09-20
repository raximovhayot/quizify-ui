import { ArrowRight } from 'lucide-react';

import React, { JSX } from 'react';

import { useTranslations } from 'next-intl';

import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';
import { ROUTES_APP } from '@/components/features/student/routes';

import { EmptyState } from './EmptyState';

interface QuizSimpleListProps {
  items: QuizDataDTO[];
  emptyLabel: string;
  icon?: JSX.Element;
}

export function QuizSimpleList({
  items,
  emptyLabel,
  icon,
}: QuizSimpleListProps) {
  const t = useTranslations();
  if (!items || items.length === 0) {
    return <EmptyState icon={icon} message={emptyLabel} />;
  }
  return (
    <ul className="space-y-2">
      {items.map((q) => (
        <li
          key={q.id}
          className="rounded-md border p-4 hover:bg-accent/40 flex items-center justify-between"
        >
          <div className="min-w-0 pr-4">
            <div className="font-medium line-clamp-1">{q.title}</div>
            {q.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {q.description}
              </div>
            )}
          </div>
          <a
            className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
            href={`${ROUTES_APP.baseUrl()}/quizzes/${q.id}`}
            aria-label={t('common.view', { fallback: 'View' })}
          >
            {t('common.view', { fallback: 'View' })}
            <ArrowRight className="h-4 w-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export default QuizSimpleList;
