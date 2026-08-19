import type { Episode } from '@/types/rickAndMorty';

interface EpisodeListProps {
  title: string;
  episodes: Episode[];
  emptyMessage?: string;
  /** Highlights this column (used for "Shared Episodes"). */
  accent?: boolean;
}

export function EpisodeList({
  title,
  episodes,
  emptyMessage = 'No episodes to show.',
  accent = false,
}: EpisodeListProps) {
  return (
    <section
      data-testid="episode-list"
      aria-label={title}
      // `border-t -mt-px` repaints the shared edge above this column in
      // its own accent color instead of the neutral gray it'd otherwise
      // inherit from the wrapping row.
      className={`max-h-60 min-w-0 flex-1 overflow-y-auto border-b px-4 pb-4 last:border-b-0 md:max-h-80 md:border-r md:border-b-0 md:last:border-r-0 ${
        accent
          ? 'border-t -mt-px border-portal-dark/20 bg-portal-dark/5 dark:border-portal-dark/25 dark:bg-portal-dark/10'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
      }`}
    >
      {/* Sticky header needs an opaque background (unlike the section's own
          translucent tint) so scrolled rows don't show through underneath
          it. `color-mix` against `--page-bg` (the real backdrop, not a
          guessed white) reproduces that tint as a solid color instead of a
          hardcoded hex that can drift out of sync. Padding lives on the
          header (`pt-4`), not the section, because `overflow-y-auto` clips
          at the padding edge — top padding on the scroll container itself
          would be scrollable space with nothing painted over it. */}
      <h3
        className={`sticky top-0 z-10 mb-2.5 flex items-center justify-between gap-2 border-b pt-4 pb-2 ${
          accent
            ? 'border-portal-dark/20 bg-[color-mix(in_srgb,var(--color-portal-dark)_5%,var(--page-bg))] dark:border-portal-dark/25 dark:bg-[color-mix(in_srgb,var(--color-portal-dark)_10%,var(--page-bg))]'
            : 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-900'
        }`}
      >
        <span
          className={`min-w-0 truncate text-xs font-bold tracking-wide uppercase ${
            accent ? 'text-portal-dark' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {title}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-normal ${
            accent
              ? 'bg-portal-dark/15 text-portal-dark'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          {episodes.length}
        </span>
      </h3>

      {episodes.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">{emptyMessage}</p>
      ) : (
        <ul>
          {episodes.map((ep) => (
            <li
              key={ep.id}
              className="flex items-start gap-2 border-b border-black/5 py-2 last:border-b-0 dark:border-white/10"
            >
              <span
                className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
                  accent
                    ? 'bg-portal-dark/15 text-portal-dark'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {ep.episode}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink dark:text-gray-100">
                  {ep.name}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{ep.air_date}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
