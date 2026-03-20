'use client';

import { KindergartenListItem } from '@/lib/types';
import { ESTABLISH_BADGE_COLORS } from '@/lib/constants';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

interface KindergartenListProps {
  items: KindergartenListItem[];
  selectedKinderCode: string | null;
  onSelectItem: (kinderCode: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  rankingMode?: boolean;
  pageOffset?: number;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse border border-gray-200 rounded px-3 py-2 mb-2">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-1" />
      <div className="h-3 bg-gray-200 rounded w-full" />
    </div>
  );
}

export default function KindergartenList({
  items,
  selectedKinderCode,
  onSelectItem,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
  isError,
  isEmpty,
  rankingMode = false,
  pageOffset = 0,
}: KindergartenListProps) {
  if (isLoading) {
    return (
      <div className="p-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-3">
        <div className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">
          목록 로드 실패. 다시 시도해 주세요.
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title="검색 결과가 없습니다"
        description="필터를 변경하거나 지도를 이동해 보세요."
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2">
        {items.map((item, idx) => {
          const rank = pageOffset + idx + 1;
          const isSelected = item.kinderCode === selectedKinderCode;
          const badgeClass =
            ESTABLISH_BADGE_COLORS[item.establish ?? ''] ?? 'bg-gray-300 text-gray-700';

          return (
            <div
              key={item.kinderCode}
              role="button"
              tabIndex={0}
              onClick={() => onSelectItem(item.kinderCode)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectItem(item.kinderCode);
              }}
              className={`border rounded px-3 py-2 mb-2 cursor-pointer transition
                ${isSelected
                  ? 'border-blue-600 bg-blue-50 border-2'
                  : 'border-gray-200 hover:bg-blue-50'
                }`}
              aria-label={`${item.kindername} 선택`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {rankingMode && (
                    <span className={`flex-shrink-0 text-xs font-bold w-6 text-center
                      ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {rank}
                    </span>
                  )}
                  <p className="font-semibold text-sm text-gray-900 leading-snug flex-1 truncate">
                    {item.kindername}
                  </p>
                </div>
                {item.establish && (
                  <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${badgeClass}`}>
                    {item.establish}
                  </span>
                )}
              </div>
              {item.addr && (
                <p className="text-xs text-gray-600 truncate mb-1">{item.addr}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  갱신 {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }) : '-'}
                </span>
                <span className="text-xs text-gray-500">
                  {item.totalChildCount}명 / {item.totalClassCount}학급
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 p-2 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-40"
            aria-label="이전 페이지"
          >
            &lt;
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, currentPage - 2);
            const page = start + i;
            if (page > totalPages) return null;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-2 py-1 text-xs rounded ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label={`${page} 페이지`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-40"
            aria-label="다음 페이지"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}
