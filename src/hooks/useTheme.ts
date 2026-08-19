'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Syncs to the class the inline script in layout.tsx already applied
    // before first paint — can't read it during render, only after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // Storage disabled (e.g. private browsing) — toggle still works this visit.
    }
  }

  return { isDark, toggle, mounted };
}
