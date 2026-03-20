import { renderHook, act } from '@testing-library/react';
import { useFavorites } from './useFavorites';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockStorage[key] = value; },
      removeItem: (key: string) => { delete mockStorage[key]; },
    },
    writable: true,
  });
});

describe('useFavorites', () => {
  it('starts with empty favorites', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.isFavorite('ABC')).toBe(false);
  });

  it('adds a favorite', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggle('ABC');
    });
    expect(result.current.isFavorite('ABC')).toBe(true);
  });

  it('removes a favorite on second toggle', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggle('ABC');
      result.current.toggle('ABC');
    });
    expect(result.current.isFavorite('ABC')).toBe(false);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggle('XYZ');
    });
    const stored = JSON.parse(mockStorage['kinder_favorites'] ?? '[]') as string[];
    expect(stored).toContain('XYZ');
  });
});
