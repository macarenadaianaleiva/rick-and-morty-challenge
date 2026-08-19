'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCharacters } from '@/hooks/useCharacters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { getStatusDotClass } from '@/utils/statusColors';
import { CharacterCard } from '../CharacterCard/CharacterCard';
import { CharacterCardSkeleton } from '../CharacterCard/CharacterCardSkeleton';
import { Pagination } from '../Pagination/Pagination';
import { ErrorState } from '../ErrorState/ErrorState';
import { StatusFilter } from '../StatusFilter/StatusFilter';
import type { Character } from '@/types/rickAndMorty';

interface CharacterPanelProps {
  title: string;
  selectedCharacter: Character | null;
  /** Set when resolving `selectedCharacter` (e.g. from a shared URL id) failed — a broken/stale share link, not simply "nothing picked yet". */
  selectedCharacterError?: string | null;
  onRetrySelectedCharacter?: () => void;
  onSelect: (character: Character) => void;
  onClear: () => void;
  /** The other panel's current selection, disabled here to prevent picking the same character twice. */
  excludeCharacterId?: number | null;
  excludeLabel?: string;
}

const SKELETON_COUNT = 8;
const GRID_CLASS = 'grid grid-cols-1 content-start gap-2.5 sm:grid-cols-2';
const RESULTS_AREA_CLASS = 'h-[340px] overflow-y-auto overflow-x-hidden p-1.5';

function SwapIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 4v13" />
      <path d="M4 14l3 3 3-3" />
      <path d="M17 20V7" />
      <path d="M20 10l-3-3-3 3" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function SelectedSummary({
  title,
  character,
  onChange,
  onClear,
}: {
  title: string;
  character: Character;
  onChange: () => void;
  onClear: () => void;
}) {
  return (
    <div
      data-testid="panel-selected-character"
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-portal-dark/40 bg-portal-dark/5 p-3 dark:border-portal-dark/50 dark:bg-portal-dark/10"
    >
      <Image
        src={character.image}
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-32 flex-1">
        <p className="truncate text-base font-bold text-ink dark:text-gray-100">{character.name}</p>
        <p className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${getStatusDotClass(character.status)}`}
          />
          {character.status} - {character.species}
        </p>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onChange}
          data-testid="change-selection-button"
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-portal-dark/30 bg-white px-3 py-1.5 text-xs font-semibold text-portal-dark transition-colors hover:bg-portal-dark/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-portal-dark focus-visible:ring-offset-1 dark:border-portal-dark/40 dark:bg-gray-900 dark:hover:bg-portal-dark/15"
        >
          <SwapIcon />
          Change
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label={`Remove selection for ${title}`}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-900/10 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-portal-dark focus-visible:ring-offset-1 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100"
        >
          <RemoveIcon />
          Remove
        </button>
      </div>
    </div>
  );
}

export function CharacterPanel({
  title,
  selectedCharacter,
  selectedCharacterError = null,
  onRetrySelectedCharacter,
  onSelect,
  onClear,
  excludeCharacterId = null,
  excludeLabel,
}: CharacterPanelProps) {
  const [forceExpanded, setForceExpanded] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  // Resets to page 1 as soon as the search/status filter settles — adjusted
  // during render instead of an effect, to avoid a stale-page commit.
  const filtersKey = `${debouncedSearch}|${status}`;
  const [settledFiltersKey, setSettledFiltersKey] = useState(filtersKey);
  if (filtersKey !== settledFiltersKey) {
    setSettledFiltersKey(filtersKey);
    setPage(1);
  }

  const { characters, totalPages, loading, isFetching, error, refetch } = useCharacters(
    page,
    debouncedSearch,
    status,
  );

  function handleSelect(character: Character) {
    setForceExpanded(false);
    onSelect(character);
  }

  return (
    <section
      aria-label={title}
      className="flex min-w-0 flex-1 flex-col rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60"
    >
      <h2 className="mb-3 text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
        {title}
      </h2>

      {selectedCharacter && !forceExpanded ? (
        <SelectedSummary
          title={title}
          character={selectedCharacter}
          onChange={() => setForceExpanded(true)}
          onClear={onClear}
        />
      ) : (
        <>
          <div
            className={`mb-3 flex h-9 items-center gap-2 rounded-md border px-2 py-1.5 text-xs ${
              selectedCharacter
                ? 'border-portal-dark/40 bg-portal-dark/5 dark:border-portal-dark/50 dark:bg-portal-dark/10'
                : selectedCharacterError
                  ? 'border-dead/40 bg-dead/5 text-dead dark:bg-dead/10'
                  : 'border-dashed border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500'
            }`}
          >
            {selectedCharacter ? (
              <div
                data-testid="panel-selected-character"
                className="flex w-full min-w-0 items-center gap-2"
              >
                <Image
                  src={selectedCharacter.image}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 shrink-0 rounded-full object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-300">
                  Selected:{' '}
                  <strong className="text-ink dark:text-gray-100">{selectedCharacter.name}</strong>{' '}
                  · {selectedCharacter.status} - {selectedCharacter.species}
                </span>
                <button
                  type="button"
                  onClick={onClear}
                  aria-label={`Remove selection for ${title}`}
                  className="shrink-0 cursor-pointer rounded px-1 text-gray-500 hover:bg-portal-dark/10 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-portal-dark dark:text-gray-400 dark:hover:text-gray-100"
                >
                  ✕
                </button>
              </div>
            ) : selectedCharacterError ? (
              <div className="flex w-full min-w-0 items-center justify-between gap-2">
                <span className="min-w-0 truncate" title={selectedCharacterError}>
                  Couldn&apos;t load the shared character
                </span>
                <button
                  type="button"
                  onClick={onRetrySelectedCharacter}
                  className="shrink-0 cursor-pointer font-semibold underline decoration-dotted underline-offset-2 hover:text-dead/80"
                >
                  Retry
                </button>
              </div>
            ) : (
              <span>No character selected yet</span>
            )}
          </div>

          <div className="mb-3 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name…"
                aria-label={`Search character in ${title}`}
                data-testid="character-search-input"
                className="w-full rounded-md border border-gray-300 bg-white py-1.5 pr-3 pl-8 text-sm outline-none focus:border-portal-dark dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
              />
            </div>
            <StatusFilter
              value={status}
              onChange={setStatus}
              label={`Filter by status in ${title}`}
            />
          </div>

          {error && (
            <ErrorState message={`Couldn't load characters: ${error}`} onRetry={() => refetch()} />
          )}

          {!error && loading && (
            <div className={`${GRID_CLASS} ${RESULTS_AREA_CLASS}`} aria-busy="true">
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <CharacterCardSkeleton key={index} />
              ))}
            </div>
          )}

          {!error && !loading && characters.length === 0 && (
            <div className={`flex items-center justify-center ${RESULTS_AREA_CLASS}`}>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                No characters found{debouncedSearch && ` for "${debouncedSearch}"`}.
              </p>
            </div>
          )}

          {!error && !loading && characters.length > 0 && (
            <div className={`${GRID_CLASS} ${RESULTS_AREA_CLASS}`}>
              {characters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  selected={selectedCharacter?.id === character.id}
                  onSelect={handleSelect}
                  disabledReason={
                    character.id === excludeCharacterId ? `Already in ${excludeLabel}` : undefined
                  }
                />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            isFetching={isFetching}
          />
        </>
      )}
    </section>
  );
}
