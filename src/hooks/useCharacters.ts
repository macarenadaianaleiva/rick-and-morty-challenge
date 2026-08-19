'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchCharacters } from '@/lib/api';
import { charactersQueryKey } from '@/lib/query-keys';

export { charactersQueryKey };

export function useCharacters(page: number, name = '', status = '') {
  const query = useQuery({
    queryKey: charactersQueryKey(page, name, status),
    queryFn: () => fetchCharacters(page, name, status),
    placeholderData: keepPreviousData,
  });

  return {
    characters: query.data?.results ?? [],
    totalPages: query.data?.info.pages ?? 1,
    loading: query.isPending,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}
