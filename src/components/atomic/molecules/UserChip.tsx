import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface UserChipProps {
  name: string;
  subtitle?: string;
  imageUrl?: string;
  end?: React.ReactNode;
  className?: string;
}

/**
 * Molecule: UserChip
 * Compact identity element: Avatar + name + optional subtitle/action.
 */
export function UserChip({ name, subtitle, imageUrl, end, className = '' }: Readonly<UserChipProps>) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={[
      'flex items-center gap-2 rounded-md border px-3 py-2 bg-card',
      className,
    ].filter(Boolean).join(' ')}>
      <Avatar className="h-8 w-8">
        {imageUrl ? (
          <AvatarImage src={imageUrl} alt={name} />
        ) : (
          <AvatarFallback aria-hidden>{initials}</AvatarFallback>
        )}
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium leading-tight truncate" title={name}>{name}</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground leading-tight truncate" title={subtitle}>
            {subtitle}
          </div>
        )}
      </div>
      {end ? <div className="shrink-0">{end}</div> : null}
    </div>
  );
}

export default UserChip;
