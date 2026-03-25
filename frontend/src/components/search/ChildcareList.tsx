'use client';

import { ChildcareListItem } from '@/lib/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

const TYPE_BADGE_COLORS: Record<string, string> = {
  '국공립': 'bg-blue-100 text-blue-800',
  '민간': 'bg-orange-100 text-orange-800',
  '가정': 'bg-green-100 text-green-800',
  '법인': 'bg-purple-100 text-purple-800',
  '직장': 'bg-yellow-100 text-yellow-800',
  '협동': 'bg-pink-100 text-pink-800',
};

interface ChildcareListProps {
  items: ChildcareListItem[];
  selectedStcode: string | null;
  onSelectItem: (stcode: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
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

export default function ChildcareList({
  items,
  selectedStcode,
  onSelectItem,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
  isError,
  isEmpty,
}: ChildcareListProps) {
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
        {items.map((item) => {
          const isSelected = item.stcode === selectedStcode;
          const typeKey = item.crtypename?.replace(/어린이집$/, '').trim() ?? '';
          const badgeClass = TYPE_BADGE_COLORS[typeKey] ?? 'bg-gray-300 text-gray-700';

          return (
            <div
              key={item.stcode}
              role="button"
              tabIndex={0}
              onClick={() => onSelectItem(item.stcode)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectItem(item.stcode);
              }}
              className={`border rounded px-3 py-2 mb-2 cursor-pointer transition
                ${isSelected
                  ? 'border-green-600 bg-green-50 border-2'
                  : 'border-gray-200 hover:bg-green-50'
                }`}
              aria-label={`${item.crname} 선택`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-semibold text-sm text-gray-900 leading-snug flex-1 truncate">
                  {item.crname}
                </p>
                {item.crtypename && (
                  <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${badgeClass}`}>
                    {item.crtypename}
                  </span>
                )}
              </div>
              {item.craddr && (
                <p className="text-xs text-gray-600 truncate mb-1">{item.craddr}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  갱신 {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }) : '-'}
                </span>
                <span className="text-xs text-gray-500">
                  정원 {item.crcapat}명 / 현원 {item.crchcnt}명
                </span>
              </div>
            </div>
          );
        })}
      </div>

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
                    ? 'bg-green-600 text-white'
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
