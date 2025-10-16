import { Skeleton } from '@/components/ui/skeleton';

export function StudentHistorySkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-48" />
      <div className="divide-y rounded-md border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
