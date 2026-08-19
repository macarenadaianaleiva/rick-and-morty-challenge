'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CharacterPanel } from '@/components/CharacterPanel/CharacterPanel';
import { ComparisonToolbar } from '@/components/ComparisonToolbar/ComparisonToolbar';
import { EpisodeList } from '@/components/EpisodeList/EpisodeList';
import { EpisodeListSkeleton } from '@/components/EpisodeList/EpisodeListSkeleton';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import { Wordmark } from '@/components/Wordmark/Wordmark';
import { useEpisodesComparison } from '@/hooks/useEpisodesComparison';
import { fetchCharacterById } from '@/lib/api';
import { CHARACTER_1_LABEL, CHARACTER_2_LABEL } from '@/lib/constants';
import { characterByIdQueryKey } from '@/lib/query-keys';
import type { Character } from '@/types/rickAndMorty';

interface HomeClientProps {
  initialCharacter1Id?: number | null;
  initialCharacter2Id?: number | null;
}

// Resolves a character id into the full Character via useQuery, so both a
// shared-URL id (server-prefetched) and a clicked card (seeded below in
// selectCharacter) go through the same source of truth. Exposes `error` too:
// a shared link can carry an id that no longer exists (or never did), and
// that failure needs to reach the UI instead of just silently resolving to
// "nothing selected".
function useSelectedCharacter(id: number | null) {
  const query = useQuery({
    queryKey: characterByIdQueryKey(id),
    queryFn: id != null ? () => fetchCharacterById(id) : skipToken,
    staleTime: Infinity,
  });
  return {
    character: query.data ?? null,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function HomeClient({
  initialCharacter1Id = null,
  initialCharacter2Id = null,
}: HomeClientProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  const [character1Id, setCharacter1Id] = useState<number | null>(initialCharacter1Id);
  const [character2Id, setCharacter2Id] = useState<number | null>(initialCharacter2Id);

  const {
    character: character1,
    error: character1Error,
    refetch: refetchCharacter1,
  } = useSelectedCharacter(character1Id);
  const {
    character: character2,
    error: character2Error,
    refetch: refetchCharacter2,
  } = useSelectedCharacter(character2Id);

  const comparisonRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (character1Id != null && character2Id != null) {
      comparisonRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }, [character1Id, character2Id, prefersReducedMotion]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: number | null) =>
      value != null ? params.set(key, String(value)) : params.delete(key);

    setOrDelete('c1', character1Id);
    setOrDelete('c2', character2Id);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character1Id, character2Id]);

  function selectCharacter(setId: (id: number) => void) {
    return (character: Character) => {
      queryClient.setQueryData(characterByIdQueryKey(character.id), character);
      setId(character.id);
    };
  }

  function clearSelection() {
    setCharacter1Id(null);
    setCharacter2Id(null);
  }

  const { only1, shared, only2, loading, isFetching, error, refetch } = useEpisodesComparison(
    character1,
    character2,
  );

  const bothSelected = Boolean(character1 && character2);

  return (
    <main className="mx-auto max-w-6xl px-6 pt-6 pb-12">
      <header className="mb-2 flex items-center justify-between gap-3">
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
      <p className="mb-4 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
        Pick a character in <strong className="font-semibold">{CHARACTER_1_LABEL}</strong> and
        another in <strong className="font-semibold">{CHARACTER_2_LABEL}</strong> to see which
        episodes they share and which ones are exclusive to each.
      </p>

      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <CharacterPanel
          title={CHARACTER_1_LABEL}
          selectedCharacter={character1}
          selectedCharacterError={character1Error}
          onRetrySelectedCharacter={refetchCharacter1}
          onSelect={selectCharacter(setCharacter1Id)}
          onClear={() => setCharacter1Id(null)}
          excludeCharacterId={character2Id}
          excludeLabel={CHARACTER_2_LABEL}
        />
        <motion.div
          aria-hidden="true"
          animate={bothSelected && !prefersReducedMotion ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mx-auto mt-9 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-lg font-bold text-white md:mx-0"
        >
          +
        </motion.div>
        <CharacterPanel
          title={CHARACTER_2_LABEL}
          selectedCharacter={character2}
          selectedCharacterError={character2Error}
          onRetrySelectedCharacter={refetchCharacter2}
          onSelect={selectCharacter(setCharacter2Id)}
          onClear={() => setCharacter2Id(null)}
          excludeCharacterId={character1Id}
          excludeLabel={CHARACTER_1_LABEL}
        />
      </div>

      <div ref={comparisonRef} className="mt-4 scroll-mt-4">
        {character1 && character2 && (
          <ComparisonToolbar onClear={clearSelection} isFetching={isFetching} />
        )}

        <AnimatePresence mode="wait">
          {!bothSelected && (
            <motion.p
              key="hint"
              data-testid="selection-hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-dashed border-gray-300 bg-white p-5 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {character1 ? (
                <>
                  Now pick a character in <strong>{CHARACTER_2_LABEL}</strong> ↑
                </>
              ) : character2 ? (
                <>
                  Now pick a character in <strong>{CHARACTER_1_LABEL}</strong> ↑
                </>
              ) : (
                <>Pick a character in each column above to get started ↑</>
              )}
            </motion.p>
          )}

          {bothSelected && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorState message={`Couldn't load episodes: ${error}`} onRetry={() => refetch()} />
            </motion.div>
          )}

          {bothSelected && loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col overflow-hidden rounded-lg border border-gray-200 md:flex-row dark:border-gray-700"
              aria-busy="true"
              aria-label="Loading episodes"
            >
              <EpisodeListSkeleton />
              <EpisodeListSkeleton />
              <EpisodeListSkeleton />
            </motion.div>
          )}

          {bothSelected && !loading && !error && (
            <motion.div
              key="episodes"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 md:flex-row dark:border-gray-700"
            >
              {!prefersReducedMotion && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 z-10 hidden w-32 bg-gradient-to-r from-transparent via-portal/50 to-transparent md:block"
                  initial={{ left: '-15%' }}
                  animate={{ left: '105%' }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                />
              )}
              <EpisodeList title={`${CHARACTER_1_LABEL} - Only Episodes`} episodes={only1} />
              <EpisodeList title="Characters #1 & #2 - Shared Episodes" episodes={shared} accent />
              <EpisodeList title={`${CHARACTER_2_LABEL} - Only Episodes`} episodes={only2} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
