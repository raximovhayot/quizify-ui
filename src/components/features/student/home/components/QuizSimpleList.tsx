import { ArrowRight, FileQuestion } from 'lucide-react';

import React, { JSX } from 'react';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';
import { ROUTES_APP } from '@/components/features/student/routes';

import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item';

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
      {items.map((q) => (
        <Item key={q.id} variant="outline">
          <ItemContent>
            <ItemTitle className="font-medium line-clamp-1">{q.title}</ItemTitle>
            {q.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {q.description}
              </div>
            )}
          </ItemContent>
          <ItemActions>
            <Link
              className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
              href={`${ROUTES_APP.baseUrl()}/quizzes/${q.id}`}
              aria-label={t('common.view', { fallback: 'View' })}
            >
              {t('common.view', { fallback: 'View' })}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}

export default QuizSimpleList;
