import React, { JSX } from 'react';

import { useTranslations } from 'next-intl';

import { EmptyState } from '@/components/shared/ui/EmptyState';
import { List, ListItem } from '@/components/atomic/atoms';
import { AssignmentRegistrationItem } from '@/components/features/student/assignment/services/studentAssignmentService';

interface RegistrationSimpleListProps {
  items: AssignmentRegistrationItem[];
  emptyLabel: string;
  icon?: JSX.Element;
}

/**
 * RegistrationSimpleList — renders a simple list of upcoming/scheduled registrations for students.
 * Now composed with atomic primitives (`List`, `ListItem`) and `EmptyState` molecule.
 */
export function RegistrationSimpleList({ items, emptyLabel, icon }: Readonly<RegistrationSimpleListProps>) {
  const t = useTranslations();
  if (!items || items.length === 0) {
    return <EmptyState icon={icon} message={emptyLabel} />;
  }

  return (
    <List>
      {items.map((it, idx) => {
        const key = (it.assignmentId ?? it.id ?? idx) as number | string;
        const id = it.assignmentId ?? it.id ?? idx;
        const title = it.title ?? t('assignment.titleFallback', { id, fallback: `Assignment ${id}` });
        return (
          <ListItem key={key}>
            <div className="font-medium line-clamp-1">{title}</div>
          </ListItem>
        );
      })}
    </List>
  );
}

export default RegistrationSimpleList;
