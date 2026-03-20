'use client';

import useSWR from 'swr';
import { KindergartenListResponse, KindergartenFilters, MapBounds } from '@/lib/types';
import { buildQueryString } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

function fetcher(url: string): Promise<KindergartenListResponse> {
  return fetch(`${API_BASE}${url}`).then((res) => {
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json() as Promise<KindergartenListResponse>;
  });
}

export function useKindergartens(
  filters: Partial<KindergartenFilters>,
  bounds?: MapBounds | null,
) {
  const hasQuery =
    bounds ||
    filters.keyword ||
    filters.sidoCode ||
    filters.establish;

  // sidoCode/sggCode 선택 시 bounds 조건 제거 (서울 지도에서 제주 선택 시 0개 방지)
  const effectiveBounds = filters.sidoCode || filters.sggCode ? null : bounds;

  const params = buildQueryString({
    ...(effectiveBounds ?? {}),
    keyword: filters.keyword,
    sidoCode: filters.sidoCode,
    sggCode: filters.sggCode,
    establish: filters.establish,
    minChildren: filters.minChildren,
    maxChildren: filters.maxChildren,
    sortBy: filters.sortBy,
    page: filters.page ?? 1,
    limit: 100,
  });

  const key = hasQuery ? `/api/kindergartens?${params}` : null;

  const { data, error, isLoading, mutate } = useSWR<KindergartenListResponse>(
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
    error,
    mutate,
  };
}
