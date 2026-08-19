import { fetchCharacters, HttpError } from '@/lib/api';
import { shouldRetry } from '@/lib/query-client';

function mockFetchOnce(response: { ok: boolean; status: number; json?: () => Promise<unknown> }) {
  const fetchMock = jest.fn().mockResolvedValueOnce(response);
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe('fetchCharacters', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds the request without a name param when no search term is given', async () => {
    const fetchMock = mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ info: { count: 0, pages: 1, next: null, prev: null }, results: [] }),
    });

    await fetchCharacters(2);

    expect(fetchMock).toHaveBeenCalledWith('https://rickandmortyapi.com/api/character?page=2');
  });

  it('includes the name param when a search term is given', async () => {
    const fetchMock = mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ info: { count: 0, pages: 1, next: null, prev: null }, results: [] }),
    });

    await fetchCharacters(1, 'rick');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://rickandmortyapi.com/api/character?page=1&name=rick',
    );
  });

  it('treats a 404 from a name search as an empty page, not an error', async () => {
    mockFetchOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'There is nothing here' }),
    });

    const result = await fetchCharacters(1, 'zzzznotarealname');

    expect(result).toEqual({ info: { count: 0, pages: 1, next: null, prev: null }, results: [] });
  });

  it('still throws on a 404 that is not from a name search, as an HttpError carrying the status', async () => {
    mockFetchOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'There is nothing here' }),
    });

    const error: unknown = await fetchCharacters(999).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).message).toBe('Failed to fetch characters (status 404)');
    expect((error as HttpError).status).toBe(404);
  });
});

describe('shouldRetry', () => {
  it('does not retry a 4xx error (it will not succeed on retry)', () => {
    expect(shouldRetry(0, new HttpError('not found', 404))).toBe(false);
  });

  it('retries a 5xx error once', () => {
    expect(shouldRetry(0, new HttpError('server error', 500))).toBe(true);
    expect(shouldRetry(1, new HttpError('server error', 500))).toBe(false);
  });

  it('retries a plain network error (no status) once', () => {
    expect(shouldRetry(0, new TypeError('Failed to fetch'))).toBe(true);
    expect(shouldRetry(1, new TypeError('Failed to fetch'))).toBe(false);
  });
});
