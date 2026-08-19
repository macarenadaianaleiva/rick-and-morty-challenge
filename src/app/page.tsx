import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { fetchCharacterById, fetchCharacters } from '@/lib/api';
import { characterByIdQueryKey, charactersQueryKey } from '@/lib/query-keys';
import { HomeClient } from '@/components/Home/HomeClient';

interface PageProps {
  searchParams: Promise<{ c1?: string; c2?: string }>;
}

function parseCharacterId(raw: string | undefined): number | null {
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default async function Page({ searchParams }: PageProps) {
  const { c1, c2 } = await searchParams;
  const character1Id = parseCharacterId(c1);
  const character2Id = parseCharacterId(c2);

  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: charactersQueryKey(1),
      queryFn: () => fetchCharacters(1),
    }),
    character1Id != null &&
      queryClient.prefetchQuery({
        queryKey: characterByIdQueryKey(character1Id),
        queryFn: () => fetchCharacterById(character1Id),
      }),
    character2Id != null &&
      queryClient.prefetchQuery({
        queryKey: characterByIdQueryKey(character2Id),
        queryFn: () => fetchCharacterById(character2Id),
      }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* useSearchParams() inside HomeClient requires a Suspense boundary. */}
      <Suspense>
        <HomeClient initialCharacter1Id={character1Id} initialCharacter2Id={character2Id} />
      </Suspense>
    </HydrationBoundary>
  );
}
