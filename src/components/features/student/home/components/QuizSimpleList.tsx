import { ArrowRight } from 'lucide-react';

import React, { JSX } from 'react';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';
import { ROUTES_APP } from '@/components/features/student/routes';

import { EmptyState } from '@/components/shared/ui/EmptyState';
import { List, ListItem } from '@/components/atomic/atoms';

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
    <List>
      {items.map((q) => (
        <ListItem
          key={q.id}
          end={
            <Link
              className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
              href={`${ROUTES_APP.baseUrl()}/quizzes/${q.id}`}
              aria-label={t('common.view', { fallback: 'View' })}
            >
              {t('common.view', { fallback: 'View' })}
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="font-medium line-clamp-1">{q.title}</div>
          {q.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {q.description}
            </div>
          )}
        </ListItem>
      ))}
    </List>
  );
}

export default QuizSimpleList;
