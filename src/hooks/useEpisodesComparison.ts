'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchEpisodesByIds } from '@/lib/api';
import { episodesComparisonQueryKey } from '@/lib/query-keys';
import { extractEpisodeIds, partitionEpisodes } from '@/utils/episodes';
import type { Character, Episode } from '@/types/rickAndMorty';

interface EpisodeGroups {
  only1: Episode[];
  shared: Episode[];
  only2: Episode[];
}

async function loadEpisodeGroups(
  character1: Character,
  character2: Character,
): Promise<EpisodeGroups> {
  const ids1 = extractEpisodeIds(character1.episode);
  const ids2 = extractEpisodeIds(character2.episode);
  const { only1, shared, only2 } = partitionEpisodes(ids1, ids2);
  const allIds = Array.from(new Set([...only1, ...shared, ...only2]));

  const episodes = await fetchEpisodesByIds(allIds);
  const byId = new Map(episodes.map((episode) => [episode.id, episode]));
  const resolve = (ids: number[]): Episode[] =>
    ids.map((id) => byId.get(id)).filter((episode): episode is Episode => Boolean(episode));

  return {
    only1: resolve(only1),
    shared: resolve(shared),
    only2: resolve(only2),
  };
}

// `enabled` is what actually enforces "no episodes until both characters
// are selected" — the query never fires otherwise, instead of fetching and
// hiding the result. `placeholderData: keepPreviousData` keeps the previous
// comparison on screen while a swap loads a new one.
export function useEpisodesComparison(character1: Character | null, character2: Character | null) {
  const query = useQuery({
    queryKey: episodesComparisonQueryKey(character1?.id ?? null, character2?.id ?? null),
    queryFn: () => loadEpisodeGroups(character1 as Character, character2 as Character),
    enabled: Boolean(character1 && character2),
    placeholderData: keepPreviousData,
  });

  return {
    only1: query.data?.only1 ?? [],
    shared: query.data?.shared ?? [],
    only2: query.data?.only2 ?? [],
    loading: query.isPending && query.fetchStatus !== 'idle',
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}
