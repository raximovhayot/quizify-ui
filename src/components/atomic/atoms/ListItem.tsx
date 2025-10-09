import React, { HTMLAttributes, ReactNode } from 'react';

export interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  start?: ReactNode;
  end?: ReactNode;
}

/**
 * Atom: ListItem
 * A list item with common border/padding and optional start/end slots.
 */
export function ListItem({ start, end, className = '', children, ...props }: Readonly<ListItemProps>) {
  return (
    <li
      className={`rounded-md border p-4 hover:bg-accent/40 flex items-center justify-between ${className}`.trim()}
      {...props}
    >
      <div className="min-w-0 pr-4 flex items-center gap-2">
        {start}
        <div className="min-w-0">{children}</div>
      </div>
      {end}
    </li>
  );
}

export default ListItem;
