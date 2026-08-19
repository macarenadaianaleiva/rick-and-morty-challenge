import { act, screen, fireEvent, waitFor } from '@testing-library/react';
import { nth, renderWithQueryClient } from './test-utils';
import { CharacterPanel } from '@/components/CharacterPanel/CharacterPanel';
import * as api from '@/lib/api';
import type { Character } from '@/types/rickAndMorty';

jest.mock('@/lib/api');

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
  episode: ['https://rickandmortyapi.com/api/episode/1'],
};

describe('CharacterPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows skeleton placeholders while the first page is loading', async () => {
    mockedApi.fetchCharacters.mockReturnValue(new Promise(() => {}));

    renderWithQueryClient(
      <CharacterPanel
        title="Character #1"
        selectedCharacter={null}
        onSelect={jest.fn()}
        onClear={jest.fn()}
      />,
    );

    const skeletons = await screen.findAllByTestId('character-card-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByTestId('character-card')).not.toBeInTheDocument();
  });

  it('shows an error state with a retry button when the request fails, and recovers on retry', async () => {
    mockedApi.fetchCharacters
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        info: { count: 1, pages: 1, next: null, prev: null },
        results: [rick],
      });

    renderWithQueryClient(
      <CharacterPanel
        title="Character #1"
        selectedCharacter={null}
        onSelect={jest.fn()}
        onClear={jest.fn()}
      />,
    );

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Network error/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    expect(await screen.findByTestId('character-card')).toBeInTheDocument();
    expect(mockedApi.fetchCharacters).toHaveBeenCalledTimes(2);
  });

  it('keeps confirming the current selection even if it scrolls out of the visible results', async () => {
    mockedApi.fetchCharacters.mockResolvedValue({
      info: { count: 1, pages: 1, next: null, prev: null },
      results: [
        {
          ...rick,
          id: 999,
          status: 'Dead',
        },
      ],
    });
    const onClear = jest.fn();

    renderWithQueryClient(
      <CharacterPanel
        title="Character #1"
        selectedCharacter={rick}
        onSelect={jest.fn()}
        onClear={onClear}
      />,
    );

    const summary = await screen.findByTestId('panel-selected-character');
    expect(summary).toHaveTextContent('Rick Sanchez');
    expect(summary).toHaveTextContent('Alive - Human');

    fireEvent.click(screen.getByTestId('change-selection-button'));

    // The card on screen is a *different* Rick (id 999, Dead).
    expect(await screen.findByTestId('character-card')).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByLabelText('Remove selection for Character #1'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('collapses to a compact summary once picked, and re-collapses after picking someone new via "Change"', async () => {
    mockedApi.fetchCharacters.mockResolvedValue({
      info: { count: 2, pages: 1, next: null, prev: null },
      results: [rick, morty],
    });
    const onSelect = jest.fn();

    const { rerender } = renderWithQueryClient(
      <CharacterPanel
        title="Character #1"
        selectedCharacter={null}
        onSelect={onSelect}
        onClear={jest.fn()}
      />,
    );

    expect(screen.queryByTestId('panel-selected-character')).not.toBeInTheDocument();
    const cards = await screen.findAllByTestId('character-card');
    fireEvent.click(nth(cards, 0)); // pick Rick
    expect(onSelect).toHaveBeenCalledWith(rick);

    rerender(
      <CharacterPanel
        title="Character #1"
        selectedCharacter={rick}
        onSelect={onSelect}
        onClear={jest.fn()}
      />,
    );
    expect(await screen.findByTestId('panel-selected-character')).toHaveTextContent('Rick Sanchez');
    expect(screen.queryByTestId('character-card')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('change-selection-button'));
    const reopenedCards = await screen.findAllByTestId('character-card');
    fireEvent.click(nth(reopenedCards, 1)); // pick Morty instead
    expect(onSelect).toHaveBeenLastCalledWith(morty);

    rerender(
      <CharacterPanel
        title="Character #1"
        selectedCharacter={morty}
        onSelect={onSelect}
        onClear={jest.fn()}
      />,
    );
    expect(await screen.findByTestId('panel-selected-character')).toHaveTextContent('Morty Smith');
    expect(screen.queryByTestId('character-card')).not.toBeInTheDocument();
  });

  it('disables a card already selected on the other side, and ignores clicks on it', async () => {
    mockedApi.fetchCharacters.mockResolvedValue({
      info: { count: 1, pages: 1, next: null, prev: null },
      results: [rick],
    });
    const onSelect = jest.fn();

    renderWithQueryClient(
      <CharacterPanel
        title="Character #1"
        selectedCharacter={null}
        onSelect={onSelect}
        onClear={jest.fn()}
        excludeCharacterId={rick.id}
        excludeLabel="Character #2"
      />,
    );

    const card = await screen.findByTestId('character-card');
    expect(card).toHaveAttribute('aria-disabled', 'true');
    expect(card).toHaveTextContent('Already in Character #2');

    fireEvent.click(card);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('filters by status and resets to page 1', async () => {
    mockedApi.fetchCharacters.mockResolvedValue({
      info: { count: 1, pages: 1, next: null, prev: null },
      results: [rick],
    });

    renderWithQueryClient(
      <CharacterPanel
        title="Character #1"
        selectedCharacter={null}
        onSelect={jest.fn()}
        onClear={jest.fn()}
      />,
    );
    await screen.findByTestId('character-card');
    mockedApi.fetchCharacters.mockClear();

    fireEvent.click(screen.getByTestId('character-status-filter'));
    fireEvent.click(screen.getByRole('option', { name: 'Dead' }));

    await waitFor(() => {
      expect(mockedApi.fetchCharacters).toHaveBeenCalledWith(1, '', 'dead');
    });
  });

  describe('search', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debounces the search input instead of fetching on every keystroke', async () => {
      mockedApi.fetchCharacters.mockResolvedValue({
        info: { count: 1, pages: 1, next: null, prev: null },
        results: [rick],
      });

      renderWithQueryClient(
        <CharacterPanel
          title="Character #1"
          selectedCharacter={null}
          onSelect={jest.fn()}
          onClear={jest.fn()}
        />,
      );
      await screen.findByTestId('character-card');
      mockedApi.fetchCharacters.mockClear();

      fireEvent.change(screen.getByTestId('character-search-input'), { target: { value: 'rick' } });

      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(mockedApi.fetchCharacters).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(200);
      });
      await waitFor(() => {
        expect(mockedApi.fetchCharacters).toHaveBeenCalledWith(1, 'rick', '');
      });
    });

    it('shows an empty state when the search has no matches', async () => {
      mockedApi.fetchCharacters.mockResolvedValue({
        info: { count: 0, pages: 1, next: null, prev: null },
        results: [],
      });

      renderWithQueryClient(
        <CharacterPanel
          title="Character #1"
          selectedCharacter={null}
          onSelect={jest.fn()}
          onClear={jest.fn()}
        />,
      );

      expect(await screen.findByText(/No characters found/)).toBeInTheDocument();
    });
  });
});
