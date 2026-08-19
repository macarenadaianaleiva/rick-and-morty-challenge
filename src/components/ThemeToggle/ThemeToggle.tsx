'use client';

import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { isDark, toggle, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        mounted ? (isDark ? 'Switch to light theme' : 'Switch to dark theme') : 'Toggle theme'
      }
      data-testid="theme-toggle"
      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-base transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-portal-dark focus-visible:ring-offset-1 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      {mounted ? (isDark ? '☀️' : '🌙') : '🌓'}
    </button>
  );
}
