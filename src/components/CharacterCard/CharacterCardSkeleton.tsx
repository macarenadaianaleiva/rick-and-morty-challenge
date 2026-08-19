import { Skeleton } from '../Skeleton/Skeleton';

export function CharacterCardSkeleton() {
  return (
    <div
      data-testid="character-card-skeleton"
      className="flex w-full items-center gap-3 rounded-lg border-2 border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900"
    >
      <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-2.5 w-10" />
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
