'use client';

import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';

interface RegionStat {
  code: string;
  name: string;
  count: number;
  totalChildren: number;
}

interface RegionRankingProps {
  sidoCode: string;
  onSelectSgg?: (sggCode: string) => void;
}

const MEDAL = ['🥇', '🥈', '🥉'];

export default function RegionRanking({ sidoCode, onSelectSgg }: RegionRankingProps) {
  const url = sidoCode
    ? `/api/regions/stats?sidoCode=${sidoCode}`
    : '/api/regions/stats';

  const { data, isLoading } = useSWR<{ data: RegionStat[] }>(
    url,
    swrFetcher as (url: string) => Promise<{ data: RegionStat[] }>,
    { revalidateOnFocus: false },
  );

  const rows = data?.data ?? [];
  const label = sidoCode ? '시군구별' : '시도별';

  if (isLoading) {
    return (
      <div className="p-3 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse h-8 bg-gray-100 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      <div className="px-3 py-2 border-b border-gray-200 text-xs font-medium text-gray-500">
        {label} 유치원 수 순위
      </div>
      <div className="divide-y divide-gray-100">
        {rows.map((row, idx) => (
          <div
            key={row.code}
            className={`flex items-center px-3 py-2 gap-2 ${onSelectSgg && sidoCode ? 'cursor-pointer hover:bg-blue-50' : ''}`}
            onClick={() => onSelectSgg && sidoCode && onSelectSgg(row.code)}
          >
            <span className="w-6 text-center text-sm flex-shrink-0">
              {idx < 3 ? MEDAL[idx] : <span className="text-xs text-gray-400">{idx + 1}</span>}
            </span>
            <span className="flex-1 text-sm text-gray-800 truncate">{row.name}</span>
            <span className="text-xs text-blue-600 font-semibold flex-shrink-0">{row.count.toLocaleString()}개</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{row.totalChildren.toLocaleString()}명</span>
          </div>
        ))}
      </div>
    </div>
  );
}
