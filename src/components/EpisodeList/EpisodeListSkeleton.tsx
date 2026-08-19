import { Skeleton } from '../Skeleton/Skeleton';

interface EpisodeListSkeletonProps {
  lines?: number;
}

export function EpisodeListSkeleton({ lines = 5 }: EpisodeListSkeletonProps) {
  return (
    <section
      data-testid="episode-list-skeleton"
      className="max-h-60 min-w-0 flex-1 border-b border-gray-200 bg-white p-4 last:border-b-0 md:max-h-80 md:border-r md:border-b-0 md:last:border-r-0 dark:border-gray-700 dark:bg-gray-900"
    >
      <Skeleton className="mb-3 h-4 w-2/3" />
      <div>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-2 border-b border-black/5 py-2 last:border-b-0 dark:border-white/10"
          >
            <Skeleton className="h-4 w-11 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-2.5 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
