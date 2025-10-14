import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses: Record<NonNullable<LoadingSpinnerProps['size']>, string> = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
  };

  return <Spinner className={cn(sizeClasses[size], className)} />;
}

// Full page loading component
export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner className="size-8 mx-auto mb-4" />
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
}

// Inline loading component
export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <Spinner className="size-4" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}
