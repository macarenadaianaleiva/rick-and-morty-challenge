import { CharacterCardSkeleton } from '@/components/CharacterCard/CharacterCardSkeleton';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import { Wordmark } from '@/components/Wordmark/Wordmark';
import { CHARACTER_1_LABEL, CHARACTER_2_LABEL } from '@/lib/constants';

const SKELETON_COUNT = 8;

function PanelSkeleton({ title }: { title: string }) {
  return (
    <section
      aria-label={title}
      className="flex min-w-0 flex-1 flex-col rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60"
    >
      <h2 className="mb-3 text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
        {title}
      </h2>
      <Skeleton className="mb-3 h-9 rounded-md" />
      <div className="mb-3 flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <div className="grid h-[340px] grid-cols-1 content-start gap-2.5 overflow-hidden p-1.5 sm:grid-cols-2">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <CharacterCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

// page.tsx awaits a Promise.all of prefetches before returning anything —
// this Next.js file convention shows immediately while that's in flight,
// then swaps for the real thing. Mirrors HomeClient's shell so the swap
// doesn't reflow the page.
export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-6 pt-6 pb-12" aria-busy="true" aria-label="Loading">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h1 className="min-w-0">
          <span className="sr-only">Rick &amp; Morty - Episode Explorer</span>
          <span aria-hidden="true" className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Wordmark className="text-2xl sm:text-4xl" />
            <span className="text-sm font-semibold text-gray-500 sm:text-base dark:text-gray-400">
              - Episode Explorer
            </span>
          </span>
        </h1>
        <ThemeToggle />
      </header>
      <p className="mb-5 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
        Pick a character in <strong className="font-semibold">{CHARACTER_1_LABEL}</strong> and
        another in <strong className="font-semibold">{CHARACTER_2_LABEL}</strong> to see which
        episodes they share and which ones are exclusive to each.
      </p>
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <PanelSkeleton title={CHARACTER_1_LABEL} />
        <div
          aria-hidden="true"
          className="mx-auto mt-9 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-lg font-bold text-white md:mx-0"
        >
          +
        </div>
        <PanelSkeleton title={CHARACTER_2_LABEL} />
      </div>
    </main>
  );
}
