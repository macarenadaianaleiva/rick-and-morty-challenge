import {
  QueryClient,
  defaultShouldDehydrateQuery,
  environmentManager,
  type Query,
} from '@tanstack/react-query';
import { HttpError } from './api';

// A 404 (bad/deleted id) won't succeed on retry the way a 500 or a network
// blip might — retrying it just delays the error for no benefit. Exported
// so it can be unit-tested directly instead of only indirectly through a
// full QueryClient.
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 1;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        retry: shouldRetry,
      },
      dehydrate: {
        shouldDehydrateQuery: (query: Query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

// New client per request on the server (no cross-user cache leaks);
// singleton in the browser (reused across client-side navigations).
export function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
