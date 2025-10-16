import { Loader2 } from 'lucide-react';

import React, { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataCardProps {
  title: string;
  icon?: ReactNode;
  isLoading?: boolean;
  error?: string;
  actions?: ReactNode;
  children: ReactNode;
  headerClassName?: string;
}

/**
 * Reusable DataCard component for displaying data lists
 *
 * Provides a standardized card layout with title, optional icon, loading state,
 * error handling, and action buttons. Commonly used for quiz lists, history lists, etc.
 *
 * @example
 * ```tsx
 * <DataCard
 *   title="Recent Quizzes"
 *   icon={<BookOpen />}
 *   isLoading={isLoading}
 *   error={error?.message}
 *   actions={<RefreshButton />}
 * >
 *   <QuizList items={quizzes} />
 * </DataCard>
 * ```
 */
export function DataCard({
  title,
  icon,
  isLoading = false,
  error,
  actions,
  children,
  headerClassName,
}: Readonly<DataCardProps>) {
  return (
    <Card>
      <CardHeader
        data-slot="card-header"
        className={
          headerClassName || 'flex flex-row items-center justify-between gap-4'
        }
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <CardTitle className="text-sm font-medium leading-none truncate">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent data-slot="card-content">
        {error ? (
          <div className="text-destructive text-sm">{error}</div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export default DataCard;
