'use client';

import { ErrorState } from '@/components/ErrorState/ErrorState';

// Route-level error boundary — catches unexpected render errors in this
// segment (a bug, a null pointer) that ErrorState's own per-query usage
// elsewhere in the app doesn't cover, since those only handle *known*
// query failures. Must be a Client Component (React error boundaries are).
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
      <div className="w-full max-w-md">
        <ErrorState message={error.message || 'Something went wrong.'} onRetry={retry} />
      </div>
    </main>
  );
}
