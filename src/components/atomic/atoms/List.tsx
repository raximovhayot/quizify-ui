import React, { HTMLAttributes } from 'react';

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  dense?: boolean;
}

/**
 * Atom: List
 * A styled unordered list with optional density control.
 */
export function List({ dense = false, className = '', ...props }: Readonly<ListProps>) {
  const density = dense ? 'space-y-1' : 'space-y-2';
  return <ul className={`${density} ${className}`.trim()} {...props} />;
}

export default List;
