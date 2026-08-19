'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  isFetching = false,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-3 pt-3">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-lg leading-none hover:enabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:hover:enabled:bg-gray-800"
      >
        ‹
      </button>
      <span className="min-w-14 text-center text-sm text-gray-600 dark:text-gray-400">
        {page} / {totalPages}
        {isFetching && <span className="ml-1 animate-pulse text-portal-dark">•</span>}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-lg leading-none hover:enabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:hover:enabled:bg-gray-800"
      >
        ›
      </button>
    </div>
  );
}
