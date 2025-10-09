import React, { ReactNode } from 'react';

export interface IconHeadingProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

/**
 * Molecule: IconHeading
 * A compact heading with optional icon and small description used in list/card headers.
 */
export function IconHeading({ icon, title, description }: Readonly<IconHeadingProps>) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <div className="min-w-0">
        <div className="text-sm font-medium leading-none line-clamp-1">{title}</div>
        {description && (
          <div className="text-xs text-muted-foreground line-clamp-1">{description}</div>
        )}
      </div>
    </div>
  );
}

export default IconHeading;
