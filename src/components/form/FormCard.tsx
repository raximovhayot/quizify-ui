import React, { ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface FormCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  centerHeader?: boolean;
}

/**
 * Reusable FormCard component for consistent form layouts
 *
 * Provides a standardized card layout with title, optional description,
 * and content area for forms. Commonly used in auth and profile forms.
 *
 * @example
 * ```tsx
 * <FormCard
 *   title="Sign In"
 *   description="Enter your credentials"
 *   centerHeader
 * >
 *   <form>...</form>
 * </FormCard>
 * ```
 */
export function FormCard({
  title,
  description,
  children,
  className,
  centerHeader = false,
}: FormCardProps) {
  return (
    <Card className={className}>
      <CardHeader className={centerHeader ? 'text-center' : undefined}>
        <CardTitle className={centerHeader ? 'text-2xl font-bold' : undefined}>
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default FormCard;
