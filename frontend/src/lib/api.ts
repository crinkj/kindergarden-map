import {
  KindergartenDetail,
  KindergartenListResponse,
  KindergartenFilters,
  MapBounds,
  SidoItem,
  SggItem,
  SyncJobListResponse,
} from './types';
import { buildQueryString } from './utils';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error ${res.status}: ${error}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchKindergartens(
  filters: Partial<KindergartenFilters>,
  bounds?: MapBounds,
): Promise<KindergartenListResponse> {
  const params = buildQueryString({
    ...(bounds ?? {}),
    keyword: filters.keyword,
    sidoCode: filters.sidoCode,
    sggCode: filters.sggCode,
    establish: filters.establish,
    page: filters.page,
    limit: 100,
  });

  return apiFetch<KindergartenListResponse>(`/api/kindergartens?${params}`);
}

export async function fetchKindergartenDetail(kinderCode: string): Promise<KindergartenDetail> {
  return apiFetch<KindergartenDetail>(`/api/kindergartens/${kinderCode}`);
}

export async function fetchSidoList(): Promise<{ data: SidoItem[] }> {
  return apiFetch<{ data: SidoItem[] }>('/api/regions/sido');
}

export async function fetchSggList(sidoCode: string): Promise<{ data: SggItem[] }> {
  return apiFetch<{ data: SggItem[] }>(`/api/regions/sgg?sidoCode=${sidoCode}`);
}

export async function startSync(body: {
  jobType: 'full' | 'sido' | 'sgg';
  targetCode?: string;
}): Promise<{ jobId: number; status: string; message: string }> {
  return apiFetch('/api/admin/sync', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchSyncJobs(page = 1, limit = 20): Promise<SyncJobListResponse> {
  return apiFetch<SyncJobListResponse>(
    `/api/admin/sync/jobs?page=${page}&limit=${limit}`,
  );
}

// SWR fetcher function
export const swrFetcher = (url: string): Promise<unknown> =>
  fetch(`${API_BASE}${url}`).then((res) => {
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  });
