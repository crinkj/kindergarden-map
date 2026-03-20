'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'kinder_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(new Set(JSON.parse(stored) as string[]));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback((kinderCode: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(kinderCode)) {
        next.delete(kinderCode);
      } else {
        next.add(kinderCode);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (kinderCode: string) => favorites.has(kinderCode),
    [favorites],
  );

  return { favorites, toggle, isFavorite };
}
