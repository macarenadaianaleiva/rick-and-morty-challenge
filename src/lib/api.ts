import type { Character, CharactersApiResponse, Episode } from '@/types/rickAndMorty';

export const BASE_URL = 'https://rickandmortyapi.com/api';

// Carries the HTTP status alongside the message so callers (see the global
// `retry` predicate in query-client.ts) can tell "this will never succeed"
// (404, a bad id) apart from "this might succeed on retry" (a 500, a
// network blip) — a plain Error can't make that distinction.
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

const EMPTY_CHARACTERS_PAGE: CharactersApiResponse = {
  info: { count: 0, pages: 1, next: null, prev: null },
  results: [],
};

export async function fetchCharacters(
  page: number,
  name = '',
  status = '',
): Promise<CharactersApiResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (name) {
    params.set('name', name);
  }
  if (status) {
    params.set('status', status);
  }

  const res = await fetch(`${BASE_URL}/character?${params.toString()}`);

  if (!res.ok) {
    // The API returns 404 (not an empty array) when a filter matches
    // nothing — treated as an empty page, not an error.
    if (res.status === 404 && (name || status)) {
      return EMPTY_CHARACTERS_PAGE;
    }
    throw new HttpError(`Failed to fetch characters (status ${res.status})`, res.status);
  }

  return res.json() as Promise<CharactersApiResponse>;
}

export async function fetchCharacterById(id: number): Promise<Character> {
  const res = await fetch(`${BASE_URL}/character/${id}`);

  if (!res.ok) {
    throw new HttpError(`Failed to fetch character ${id} (status ${res.status})`, res.status);
  }

  return res.json() as Promise<Character>;
}

export async function fetchEpisodesByIds(ids: number[]): Promise<Episode[]> {
  if (ids.length === 0) {
    return [];
  }

  const idsParam = ids.join(',');
  const res = await fetch(`${BASE_URL}/episode/${idsParam}`);

  if (!res.ok) {
    throw new HttpError(`Failed to fetch episodes (status ${res.status})`, res.status);
  }

  // The API returns a single object for one id, an array for multiple.
  const data = (await res.json()) as Episode | Episode[];
  return Array.isArray(data) ? data : [data];
}
