'use client';

import { useEffect, useRef, useState } from 'react';
import { getStatusDotClass } from '@/utils/statusColors';

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

// `as const`: a fixed-length tuple, so `OPTIONS[0]` below stays typed as
// defined (not `| undefined`) under `noUncheckedIndexedAccess`.
const OPTIONS = [
  { value: '', label: 'All' },
  { value: 'alive', label: 'Alive' },
  { value: 'dead', label: 'Dead' },
  { value: 'unknown', label: 'Unknown' },
] as const;

export function StatusFilter({ value, onChange, label }: StatusFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selected = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0];

  return (
    <div ref={rootRef} className="relative shrink-0 text-sm">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        data-testid="character-status-filter"
        className="flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 outline-none focus:border-portal-dark focus-visible:ring-2 focus-visible:ring-portal-dark focus-visible:ring-offset-1 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
      >
        {value && <span className={`h-2 w-2 shrink-0 rounded-full ${getStatusDotClass(value)}`} />}
        <span>{selected.label}</span>
        <span aria-hidden="true" className="text-[10px] text-gray-400 dark:text-gray-500">
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          data-testid="character-status-filter-menu"
          className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {OPTIONS.map((option) => (
            <li key={option.value}>
              {/* role="option" belongs on the button (the focusable
                  element), not the <li>. */}
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center gap-1.5 px-2.5 py-1.5 text-left outline-none hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-gray-700 dark:focus-visible:bg-gray-700 ${
                  option.value === value
                    ? 'font-semibold text-portal-dark'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {option.value ? (
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${getStatusDotClass(option.value)}`}
                  />
                ) : (
                  <span className="h-2 w-2 shrink-0" aria-hidden="true" />
                )}
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
