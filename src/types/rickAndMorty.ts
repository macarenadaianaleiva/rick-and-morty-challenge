export type CharacterStatus = 'Alive' | 'Dead' | 'unknown';

export interface Character {
  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  image: string;
  /** List of full episode URLs the character appears in, as returned by the API */
  episode: string[];
}

export interface ApiInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface CharactersApiResponse {
  info: ApiInfo;
  results: Character[];
}

export interface Episode {
  id: number;
  name: string;
  air_date: string;
  /** e.g. "S01E01" */
  episode: string;
}
