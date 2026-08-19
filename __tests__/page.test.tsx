import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { nth, renderWithQueryClient } from './test-utils';
import { HomeClient } from '@/components/Home/HomeClient';
import * as api from '@/lib/api';
import type { Character, Episode } from '@/types/rickAndMorty';

jest.mock('@/lib/api');

// No real App Router in jsdom — mock the navigation hooks so `mockReplace`
// can assert the URL sync HomeClient does.
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

const mockedApi = api as jest.Mocked<typeof api>;

const rick: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: ['https://rickandmortyapi.com/api/episode/1'],
};

const morty: Character = {
  id: 2,
  name: 'Morty Smith',
  status: 'Alive',
  species: 'Human',
  image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
  episode: [
    'https://rickandmortyapi.com/api/episode/1',
    'https://rickandmortyapi.com/api/episode/2',
  ],
};

const summer: Character = {
  id: 3,
  name: 'Summer Smith',
  status: 'Alive',
  species: 'Human',
  image: 'https://rickandmortyapi.com/api/character/avatar/3.jpeg',
  episode: ['https://rickandmortyapi.com/api/episode/3'],
};

const episodes: Episode[] = [
  { id: 1, name: 'Pilot', air_date: 'December 2, 2013', episode: 'S01E01' },
  { id: 2, name: 'Lawnmower Dog', air_date: 'December 9, 2013', episode: 'S01E02' },
];

describe('HomeClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApi.fetchCharacters.mockResolvedValue({
      info: { count: 2, pages: 1, next: null, prev: null },
      results: [rick, morty],
    });
    mockedApi.fetchEpisodesByIds.mockResolvedValue(episodes);
  });

  it('syncs the selection to the URL as ?c1=&c2= (shareable comparison link)', async () => {
    renderWithQueryClient(<HomeClient />);

    const cards = await screen.findAllByTestId('character-card');
    fireEvent.click(nth(cards, 0)); // Character #1 -> Rick

    await waitFor(() => {
      expect(mockReplace).toHaveBeenLastCalledWith('/?c1=1', { scroll: false });
    });

    fireEvent.click(nth(cards, 3)); // Character #2 -> Morty

    await waitFor(() => {
      expect(mockReplace).toHaveBeenLastCalledWith('/?c1=1&c2=2', { scroll: false });
    });
  });

  it('shows the comparison toolbar once both are selected, and clears back to the hint', async () => {
    renderWithQueryClient(<HomeClient />);

    const cards = await screen.findAllByTestId('character-card');
    fireEvent.click(nth(cards, 0)); // Character #1 -> Rick
    fireEvent.click(nth(cards, 3)); // Character #2 -> Morty

    expect(await screen.findByTestId('comparison-toolbar')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('clear-selection-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('comparison-toolbar')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('selection-hint')).toBeInTheDocument();
    expect(mockReplace).toHaveBeenLastCalledWith('/', { scroll: false });
  });

  it('hydrates the comparison from initial character ids (deep link / shared URL)', async () => {
    mockedApi.fetchCharacterById.mockImplementation((id) =>
      Promise.resolve(id === rick.id ? rick : morty),
    );

    renderWithQueryClient(
      <HomeClient initialCharacter1Id={rick.id} initialCharacter2Id={morty.id} />,
    );

    const episodeLists = await screen.findAllByTestId('episode-list');
    expect(episodeLists).toHaveLength(3);
    expect(screen.getByText('Character #1 - Only Episodes')).toBeInTheDocument();
    expect(screen.getByText('Character #2 - Only Episodes')).toBeInTheDocument();
    expect(window.HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('shows an error with retry when a shared-URL character id fails to resolve (broken/stale link)', async () => {
    mockedApi.fetchCharacterById
      .mockRejectedValueOnce(new Error('Failed to fetch character 999 (status 404)'))
      .mockResolvedValueOnce(rick);

    renderWithQueryClient(<HomeClient initialCharacter1Id={999} />);

    const panel1 = within(screen.getByRole('region', { name: 'Character #1' }));
    expect(await panel1.findByText("Couldn't load the shared character")).toBeInTheDocument();
    // Silent failure would leave this looking like nothing was ever picked —
    // it must read as an error, not as the default empty state.
    expect(panel1.queryByText('No character selected yet')).not.toBeInTheDocument();

    fireEvent.click(panel1.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.queryByText("Couldn't load the shared character")).not.toBeInTheDocument();
    });
    expect(mockedApi.fetchCharacterById).toHaveBeenCalledTimes(2);
  });

  it('scrolls the comparison into view once both characters are selected (but not before)', async () => {
    renderWithQueryClient(<HomeClient />);

    const cards = await screen.findAllByTestId('character-card');
    fireEvent.click(nth(cards, 0)); // Character #1 -> Rick
    expect(window.HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();

    fireEvent.click(nth(cards, 3)); // Character #2 -> Morty
    await waitFor(() => {
      expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'smooth', block: 'start' }),
      );
    });
  });

  it('shows the hint and hides episode sections until both characters are selected', async () => {
    renderWithQueryClient(<HomeClient />);

    expect(await screen.findByTestId('selection-hint')).toBeInTheDocument();
    expect(screen.queryAllByTestId('episode-list')).toHaveLength(0);

    const cards = await screen.findAllByTestId('character-card');
    fireEvent.click(nth(cards, 0)); // select Rick in Character #1

    expect(screen.getByTestId('selection-hint')).toBeInTheDocument();
    expect(screen.queryAllByTestId('episode-list')).toHaveLength(0);
    expect(mockedApi.fetchEpisodesByIds).not.toHaveBeenCalled();
  });

  it('blocks selecting the same character on both sides at once', async () => {
    renderWithQueryClient(<HomeClient />);

    const cards = await screen.findAllByTestId('character-card');
    fireEvent.click(nth(cards, 0)); // Character #1 -> Rick

    await waitFor(() => {
      expect(cards[2]).toHaveAttribute('aria-disabled', 'true');
    });
    fireEvent.click(nth(cards, 2));
    expect(screen.getByTestId('selection-hint')).toBeInTheDocument();
    expect(screen.getByTestId('panel-selected-character')).toHaveTextContent('Rick Sanchez');
  });

  it('renders the three episode sections once both characters are selected', async () => {
    renderWithQueryClient(<HomeClient />);

    const cards = await screen.findAllByTestId('character-card');
    fireEvent.click(nth(cards, 0)); // Character #1 -> Rick
    fireEvent.click(nth(cards, 3)); // Character #2 -> Morty

    await waitFor(
      () => {
        expect(screen.queryByTestId('selection-hint')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const episodeLists = await screen.findAllByTestId('episode-list');
    expect(episodeLists).toHaveLength(3);
    expect(screen.getByText('Character #1 - Only Episodes')).toBeInTheDocument();
    expect(screen.getByText('Characters #1 & #2 - Shared Episodes')).toBeInTheDocument();
    expect(screen.getByText('Character #2 - Only Episodes')).toBeInTheDocument();
    expect(mockedApi.fetchEpisodesByIds).toHaveBeenCalledTimes(1);
  });

  it('keeps the previous comparison on screen (no skeleton flash) while a swapped character reloads', async () => {
    mockedApi.fetchCharacters.mockResolvedValue({
      info: { count: 3, pages: 1, next: null, prev: null },
      results: [rick, morty, summer],
    });

    let resolveSecondFetch!: (value: Episode[]) => void;
    const secondFetch = new Promise<Episode[]>((resolve) => {
      resolveSecondFetch = resolve;
    });
    mockedApi.fetchEpisodesByIds.mockResolvedValueOnce(episodes).mockReturnValueOnce(secondFetch);

    renderWithQueryClient(<HomeClient />);

    const cards = await screen.findAllByTestId('character-card');
    fireEvent.click(nth(cards, 0)); // Character #1 -> Rick
    fireEvent.click(nth(cards, 4)); // Character #2 -> Morty
    expect(await screen.findAllByTestId('episode-list')).toHaveLength(3);

    fireEvent.click(nth(screen.getAllByTestId('change-selection-button'), 0));
    const summerCard = (await screen.findAllByTestId('character-card')).find((card) =>
      card.textContent?.includes('Summer Smith'),
    );
    fireEvent.click(summerCard!); // swap Character #1 -> Summer

    await waitFor(() => {
      expect(screen.getByLabelText('Updating comparison')).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('episode-list')).toHaveLength(3);
    expect(screen.queryByLabelText('Loading episodes')).not.toBeInTheDocument();

    resolveSecondFetch(episodes);

    await waitFor(() => {
      expect(screen.queryByLabelText('Updating comparison')).not.toBeInTheDocument();
    });
  });

  it('shows an error state with retry when the episode comparison request fails', async () => {
    mockedApi.fetchEpisodesByIds
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(episodes);

    renderWithQueryClient(<HomeClient />);

    const cards = await screen.findAllByTestId('character-card');
    fireEvent.click(nth(cards, 0)); // Character #1 -> Rick
    fireEvent.click(nth(cards, 3)); // Character #2 -> Morty

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Network error/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    const episodeLists = await screen.findAllByTestId('episode-list');
    expect(episodeLists).toHaveLength(3);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
