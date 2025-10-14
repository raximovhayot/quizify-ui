import { AlertCircle, FileQuestion, Inbox } from 'lucide-react';
import React, { JSX, ReactNode } from 'react';
import {
  Empty as UIEmpty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty';

interface EmptyStateProps {
  icon?: JSX.Element;
  message: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'large' | 'inline';
}

/**
 * EmptyState wrapper built on top of shadcn/ui `empty` component.
 *
 * Keeps the existing API stable while rendering with shadcn primitives.
 * Prefer migrating call sites to use `@/components/ui/empty` directly over time.
 */
export function EmptyState({
  icon,
  message,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  // Inline variant: compact row layout (no card frame)
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center justify-center">
          {icon ?? <AlertCircle className="h-5 w-5" />}
        </span>
        <span>{message}</span>
      </div>
    );
  }

  // Use shadcn/ui Empty composition for default and large variants
  const FallbackIcon = variant === 'large' ? Inbox : FileQuestion;

  return (
    <UIEmpty className={variant === 'large' ? 'p-12 md:p-16' : undefined}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {icon ?? <FallbackIcon className={variant === 'large' ? 'size-8' : 'size-6'} />}
        </EmptyMedia>
        <EmptyTitle>{message}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </UIEmpty>
  );
}

export default EmptyState;
