interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-lg border border-dead/30 bg-dead/5 p-4 text-center text-sm text-dead dark:bg-dead/10"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="cursor-pointer rounded-md border border-dead/40 bg-white px-3 py-1 text-xs font-medium text-dead hover:bg-dead/10 dark:bg-gray-900 dark:hover:bg-dead/15"
      >
        Retry
      </button>
    </div>
  );
}
