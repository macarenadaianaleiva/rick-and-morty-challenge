// Pulls the numeric id off the end of each episode URL.
// Example: extractEpisodeIds(["https://rickandmortyapi.com/api/episode/28"]) returns [28].
export function extractEpisodeIds(urls: string[]): number[] {
  return urls.map((url) => Number(url.split('/').pop())).filter((id) => Number.isFinite(id));
}

export interface EpisodePartition {
  only1: number[];
  shared: number[];
  only2: number[];
}

export function partitionEpisodes(ids1: number[], ids2: number[]): EpisodePartition {
  const set1 = new Set(ids1);
  const set2 = new Set(ids2);

  const only1 = ids1.filter((id) => !set2.has(id));
  const shared = ids1.filter((id) => set2.has(id));
  const only2 = ids2.filter((id) => !set1.has(id));

  return { only1, shared, only2 };
}
