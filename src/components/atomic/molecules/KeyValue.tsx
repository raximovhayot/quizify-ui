import React, { ReactNode } from 'react';

export interface KeyValueProps {
  label: ReactNode;
  value: ReactNode;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

/**
 * Molecule: KeyValue
 * Semantic key/value presentation using <dl>/<dt>/<dd> with compact styling.
 */
export function KeyValue({
  label,
  value,
  orientation = 'vertical',
  className = '',
  labelClassName = '',
  valueClassName = '',
}: Readonly<KeyValueProps>) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <dl
      className={[
        isHorizontal ? 'grid grid-cols-[auto,1fr] items-baseline gap-x-3' : 'space-y-0.5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <dt className={["text-xs text-muted-foreground", isHorizontal ? 'self-center' : '', labelClassName]
        .filter(Boolean)
        .join(' ')}>
        {label}
      </dt>
      <dd className={[isHorizontal ? '' : 'text-sm font-medium', valueClassName].filter(Boolean).join(' ')}>
        {value}
      </dd>
    </dl>
  );
}

export default KeyValue;
