'use client';

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface ComparisonToolbarProps {
  onClear: () => void;
  isFetching?: boolean;
}

const SHARE_LABEL: Record<'idle' | 'copied' | 'error', string> = {
  idle: 'Share comparison',
  copied: 'Copied!',
  error: "Couldn't copy",
};

const BUTTON_CLASS =
  'flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-portal-dark focus-visible:ring-offset-1';

function ShareIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ComparisonToolbar({ onClear, isFetching = false }: ComparisonToolbarProps) {
  const { copy, status } = useCopyToClipboard();

  return (
    <div
      data-testid="comparison-toolbar"
      className="mb-3 flex flex-wrap items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900"
    >
      {isFetching && (
        <span
          className="mr-1 inline-block h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-portal-dark"
          aria-label="Updating comparison"
        />
      )}
      <button
        type="button"
        data-testid="share-comparison-button"
        onClick={() => copy(window.location.href)}
        aria-live="polite"
        className={`${BUTTON_CLASS} min-w-[150px] justify-center border-transparent bg-portal-dark text-white hover:opacity-90`}
      >
        {status === 'copied' ? <CheckIcon /> : <ShareIcon />}
        {SHARE_LABEL[status]}
      </button>
      <button
        type="button"
        data-testid="clear-selection-button"
        onClick={onClear}
        className={`${BUTTON_CLASS} border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800`}
      >
        <ClearIcon />
        Clear selection
      </button>
    </div>
  );
}
