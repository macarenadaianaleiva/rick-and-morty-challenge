import { extractEpisodeIds, partitionEpisodes } from '@/utils/episodes';

describe('extractEpisodeIds', () => {
  it('extracts numeric ids from episode urls', () => {
    const urls = [
      'https://rickandmortyapi.com/api/episode/1',
      'https://rickandmortyapi.com/api/episode/28',
    ];
    expect(extractEpisodeIds(urls)).toEqual([1, 28]);
  });

  it('returns an empty array for empty input', () => {
    expect(extractEpisodeIds([])).toEqual([]);
  });
});

describe('partitionEpisodes', () => {
  it('splits ids into only1, shared and only2', () => {
    const ids1 = [1, 2, 3, 4];
    const ids2 = [3, 4, 5, 6];

    const result = partitionEpisodes(ids1, ids2);

    expect(result.only1).toEqual([1, 2]);
    expect(result.shared).toEqual([3, 4]);
    expect(result.only2).toEqual([5, 6]);
  });

  it('returns empty shared list when characters have no episodes in common', () => {
    const result = partitionEpisodes([1, 2], [3, 4]);

    expect(result.shared).toEqual([]);
    expect(result.only1).toEqual([1, 2]);
    expect(result.only2).toEqual([3, 4]);
  });

  it('treats identical episode lists as fully shared', () => {
    const result = partitionEpisodes([1, 2], [1, 2]);

    expect(result.only1).toEqual([]);
    expect(result.only2).toEqual([]);
    expect(result.shared).toEqual([1, 2]);
  });

  it('handles empty inputs gracefully', () => {
    expect(partitionEpisodes([], [])).toEqual({ only1: [], shared: [], only2: [] });
    expect(partitionEpisodes([1], [])).toEqual({ only1: [1], shared: [], only2: [] });
  });
});
