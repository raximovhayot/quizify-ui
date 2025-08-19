'use client';

import { LucideIcon } from 'lucide-react';

import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface ContentPlaceholderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  }[];
  className?: string;
}

export function ContentPlaceholder({
  icon: Icon,
  title,
  description,
  children,
  actions = [],
  className,
}: ContentPlaceholderProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center p-8">
        {Icon && (
          <div className="mb-4 p-3 rounded-full bg-muted">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        {description && (
          <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
        )}

        {children}

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
