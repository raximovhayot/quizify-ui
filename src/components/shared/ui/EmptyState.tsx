import { AlertCircle, FileQuestion, Inbox } from 'lucide-react';

import React, { JSX, ReactNode } from 'react';

interface EmptyStateProps {
  icon?: JSX.Element;
  message: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'large' | 'inline';
}

/**
 * Enhanced EmptyState component for displaying empty states
 *
 * Provides a consistent empty state UI with icon, message, optional description,
 * and optional action button. Supports multiple variants for different contexts.
 *
 * @example
 * ```tsx
 * // Inline variant (original)
 * <EmptyState message="No quizzes found" />
 *
 * // Large variant with action
 * <EmptyState
 *   variant="large"
 *   icon={<Inbox />}
 *   message="No quizzes yet"
 *   description="Create your first quiz to get started"
 *   action={<Button>Create Quiz</Button>}
 * />
 * ```
 */
export function EmptyState({
  icon,
  message,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  // Inline variant (original implementation)
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

  // Large variant for centered empty states
  if (variant === 'large') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          {icon ?? <Inbox className="h-8 w-8 text-muted-foreground" />}
        </div>
        <h3 className="text-lg font-semibold mb-1">{message}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex items-center justify-center text-muted-foreground">
        {icon ?? <FileQuestion className="h-6 w-6" />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{message}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;
