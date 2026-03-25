'use client';

import useSWR from 'swr';
import { ChildcareListResponse, ChildcareFilters, MapBounds } from '@/lib/types';
import { buildQueryString } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

function fetcher(url: string): Promise<ChildcareListResponse> {
  return fetch(`${API_BASE}${url}`).then((res) => {
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json() as Promise<ChildcareListResponse>;
  });
}

export function useChildcares(
  filters: Partial<ChildcareFilters>,
  bounds?: MapBounds | null,
) {
  const hasQuery =
    bounds ||
    filters.keyword ||
    filters.arcode;

  const effectiveBounds = filters.arcode ? null : bounds;

  const params = buildQueryString({
    ...(effectiveBounds ?? {}),
    keyword: filters.keyword,
    arcode: filters.arcode,
    crtype: filters.crtype,
    minChildren: filters.minChildren,
    maxChildren: filters.maxChildren,
    page: filters.page ?? 1,
    limit: 100,
  });

  const key = hasQuery ? `/api/childcares?${params}` : null;

  const { data, error, isLoading } = useSWR<ChildcareListResponse>(
    key,
    fetcher,
    {
      dedupingInterval: 5000,
      focusThrottleInterval: 30000,
      revalidateOnFocus: false,
    },
  );

  return {
    data,
    isLoading,
    isError: Boolean(error),
  };
}
