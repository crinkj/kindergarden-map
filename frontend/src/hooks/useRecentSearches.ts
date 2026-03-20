'use client';

import { useState, useCallback, useEffect } from 'react';
import { KindergartenFilters } from '@/lib/types';

const STORAGE_KEY = 'kinder_recent_searches';
const MAX_SEARCHES = 5;

interface RecentSearch extends Partial<KindergartenFilters> {
  timestamp: number;
}

export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSearches(JSON.parse(stored) as RecentSearch[]);
      }
    } catch {
      // ignore
    }
  }, []);

  const addSearch = useCallback((filters: Partial<KindergartenFilters>) => {
    const entry: RecentSearch = { ...filters, timestamp: Date.now() };
    setSearches((prev) => {
      const next = [entry, ...prev].slice(0, MAX_SEARCHES);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { searches, addSearch, clearSearches };
}
