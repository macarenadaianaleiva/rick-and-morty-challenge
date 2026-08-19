'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { getStatusDotClass } from '@/utils/statusColors';
import type { Character } from '@/types/rickAndMorty';

interface CharacterCardProps {
  character: Character;
  selected: boolean;
  onSelect: (character: Character) => void;
  /** Set when this character is already picked on the other side. */
  disabledReason?: string;
}

export function CharacterCard({
  character,
  selected,
  onSelect,
  disabledReason,
}: CharacterCardProps) {
  const disabled = Boolean(disabledReason);

  return (
    <motion.button
      type="button"
      onClick={() => {
        if (!disabled) onSelect(character);
      }}
      aria-pressed={selected}
      aria-disabled={disabled}
      aria-label={disabled ? `${character.name} — ${disabledReason}` : undefined}
      data-testid="character-card"
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      animate={selected ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={[
        'flex h-full w-full items-center gap-3 rounded-lg border-2 bg-white p-2 text-left transition-colors dark:bg-gray-900',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-portal-dark focus-visible:ring-offset-1',
        disabled
          ? 'cursor-not-allowed border-gray-200 opacity-50 dark:border-gray-700'
          : selected
            ? 'cursor-pointer border-portal-dark bg-portal-dark/5 shadow-[0_0_0_2px_rgba(47,143,47,0.25)] dark:bg-portal-dark/10'
            : 'cursor-pointer border-gray-200 hover:border-portal dark:border-gray-700',
      ].join(' ')}
    >
      <Image
        src={character.image}
        alt={character.name}
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        {disabled ? (
          <span className="truncate text-[10px] font-medium tracking-wide text-gray-400 dark:text-gray-500">
            {disabledReason}
          </span>
        ) : (
          <span className="font-mono text-[10px] tracking-wide text-gray-400 dark:text-gray-500">
            ID {String(character.id).padStart(3, '0')}
          </span>
        )}
        <span className="truncate text-sm font-bold">{character.name}</span>
        <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <span
            className={`inline-block h-2 w-2 rounded-full ${getStatusDotClass(character.status)}`}
          />
          {character.status} - {character.species}
        </span>
      </div>
    </motion.button>
  );
}
