import React, { JSX } from 'react';

import { useTranslations } from 'next-intl';
import { FileQuestion } from 'lucide-react';

import { AssignmentRegistrationItem } from '@/features/student/assignment/services/studentAssignmentService';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Item, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item';

interface RegistrationSimpleListProps {
  items: AssignmentRegistrationItem[];
  emptyLabel: string;
  icon?: JSX.Element;
}

/**
 * RegistrationSimpleList — renders a simple list of upcoming/scheduled registrations for students.
 * Now composed with shadcn primitives (`ItemGroup`, `Item`) and `Empty` for the empty state.
 */
export function RegistrationSimpleList({ items, emptyLabel, icon }: Readonly<RegistrationSimpleListProps>) {
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
      {items.map((it, idx) => {
        const key = (it.assignmentId ?? it.id ?? idx) as number | string;
        const id = it.assignmentId ?? it.id ?? idx;
        const title = it.title ?? t('assignment.titleFallback', { id, fallback: `Assignment ${id}` });
        return (
          <Item key={key} variant="outline">
            <ItemContent>
              <ItemTitle className="font-medium line-clamp-1">{title}</ItemTitle>
            </ItemContent>
          </Item>
        );
      })}
    </ItemGroup>
  );
}

export default RegistrationSimpleList;
