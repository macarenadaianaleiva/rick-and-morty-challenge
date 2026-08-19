export const charactersQueryKey = (page: number, name = '', status = '') =>
  ['characters', page, name, status] as const;

export const characterByIdQueryKey = (id: number | null) => ['character', id] as const;

export const episodesComparisonQueryKey = (
  character1Id: number | null,
  character2Id: number | null,
) => ['episodes-comparison', character1Id, character2Id] as const;
