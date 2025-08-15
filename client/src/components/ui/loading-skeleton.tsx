import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  'aria-label'?: string;
}

export function LoadingSkeleton({ className, 'aria-label': ariaLabel }: LoadingSkeletonProps) {
  return (
    <div 
      className={cn("animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg", className)}
      role="status"
      aria-label={ariaLabel || "Loading content"}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingCardProps {
  title: string;
  count?: number;
}

export function LoadingCard({ title, count = 3 }: LoadingCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <LoadingSkeleton 
              key={i} 
              className="h-16" 
              aria-label={`Loading ${title} item ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
