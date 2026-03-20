'use client';

import { useState, useCallback, useRef } from 'react';
import { MapBounds } from '@/lib/types';

export function useMapBounds(debounceMs = 500) {
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateBounds = useCallback(
    (newBounds: MapBounds) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setBounds(newBounds);
      }, debounceMs);
    },
    [debounceMs],
  );

  return { bounds, updateBounds };
}
