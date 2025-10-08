import React, { JSX } from 'react';

import { EmptyState } from '@/components/features/student/home/components/EmptyState';
import { AssignmentRegistrationItem } from '@/components/features/student/assignment/services/studentAssignmentService';

interface RegistrationSimpleListProps {
  items: AssignmentRegistrationItem[];
  emptyLabel: string;
  icon?: JSX.Element;
}

/**
 * RegistrationSimpleList — renders a simple list of upcoming/scheduled registrations for students.
 * Mirrors the structure and styling of `AttemptSimpleList` but for registration items.
 */
export function RegistrationSimpleList({ items, emptyLabel, icon }: Readonly<RegistrationSimpleListProps>) {
  if (!items || items.length === 0) {
    return <EmptyState icon={icon} message={emptyLabel} />;
  }

  return (
    <ul className="space-y-2">
      {items.map((it, idx) => {
        const key = (it.assignmentId ?? it.id ?? idx) as number | string;
        const title = it.title ?? `Assignment ${(it.assignmentId ?? it.id ?? idx)}`;
        return (
          <li
            key={key}
            className="rounded-md border p-4 hover:bg-accent/40 flex items-center justify-between"
          >
            <div className="min-w-0 pr-4">
              <div className="font-medium line-clamp-1">{title}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default RegistrationSimpleList;
