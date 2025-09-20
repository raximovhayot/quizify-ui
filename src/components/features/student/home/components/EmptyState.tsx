import { AlertCircle } from 'lucide-react';

import React, { JSX } from 'react';

interface EmptyStateProps {
  icon?: JSX.Element;
  message: string;
}

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="inline-flex items-center justify-center">
        {icon ?? <AlertCircle className="h-5 w-5" />}
      </span>
      <span>{message}</span>
    </div>
  );
}

export default EmptyState;
