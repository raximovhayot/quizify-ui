import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface HistoryCardProps {
  title: string;
  isLoading?: boolean;
  error?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function HistoryCard({ title, isLoading, error, actions, children }: HistoryCardProps) {
  return (
    <Card>
      <CardHeader data-slot="card-header" className="flex flex-row items-center justify-between gap-4">
        <div className="font-medium">{title}</div>
        <div className="flex items-center gap-2">
          {actions}
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent data-slot="card-content">
        {error ? <div className="text-destructive text-sm">{error}</div> : children}
      </CardContent>
    </Card>
  );
}
