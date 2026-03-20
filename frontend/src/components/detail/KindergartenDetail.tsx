'use client';

import { KindergartenDetail as KindergartenDetailType } from '@/lib/types';
import { ESTABLISH_BADGE_COLORS } from '@/lib/constants';
import { formatDate, getDataFreshnessLabel } from '@/lib/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

interface KindergartenDetailProps {
  data: KindergartenDetailType | null;
  isFavorite: boolean;
  onToggleFavorite: (kinderCode: string) => void;
  onOpenDirections: (addr: string) => void;
  onPrint: () => void;
  isLoading: boolean;
  isError: boolean;
}

export default function KindergartenDetail({
  data,
  isFavorite,
  onToggleFavorite,
  onOpenDirections,
  onPrint,
  isLoading,
  isError,
}: KindergartenDetailProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner message="상세 정보를 불러오는 중..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          상세 정보 로드 실패. 다시 시도해 주세요.
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="선택된 유치원이 없습니다"
        description="지도에서 마커를 클릭하거나 목록에서 유치원을 선택하세요."
      />
    );
  }

  const badgeClass =
    ESTABLISH_BADGE_COLORS[data.establish ?? ''] ?? 'bg-gray-300 text-gray-700';
  const freshness = getDataFreshnessLabel(data.updatedAt);

  return (
    <div className="h-full overflow-y-auto">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-xl font-bold text-gray-900 flex-1">{data.kindername}</h2>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onToggleFavorite(data.kinderCode)}
              aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              className="text-xl text-gray-400 hover:text-red-500 transition"
            >
              {isFavorite ? '♥' : '♡'}
            </button>
            <button
              onClick={onPrint}
              aria-label="인쇄"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              🖨
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data.establish && (
            <span className={`text-xs px-2 py-1 rounded ${badgeClass}`}>
              {data.establish}
            </span>
          )}
          <span className={`text-xs ${freshness.colorClass}`}>
            업데이트: {formatDate(data.updatedAt.slice(0, 10).replace(/-/g, ''))} {freshness.label}
          </span>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3">기본 정보</h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
          {data.addr && (
            <>
              <dt className="text-gray-500 whitespace-nowrap">주소</dt>
              <dd className="text-gray-900 flex items-start gap-1">
                <span className="flex-1">{data.addr}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(data.addr ?? '').catch(() => {});
                  }}
                  className="text-xs text-blue-600 hover:underline flex-shrink-0"
                  aria-label="주소 복사"
                >
                  복사
                </button>
              </dd>
            </>
          )}
          {data.telno && (
            <>
              <dt className="text-gray-500">전화</dt>
              <dd>
                <a
                  href={`tel:${data.telno}`}
                  className="text-blue-600 hover:underline"
                >
                  {data.telno}
                </a>
              </dd>
            </>
          )}
          {data.hpaddr && (
            <>
              <dt className="text-gray-500">홈페이지</dt>
              <dd>
                <a
                  href={data.hpaddr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate block"
                >
                  바로가기
                </a>
              </dd>
            </>
          )}
          {data.opertime && (
            <>
              <dt className="text-gray-500">운영시간</dt>
              <dd className="text-gray-900">{data.opertime}</dd>
            </>
          )}
          {data.edate && (
            <>
              <dt className="text-gray-500">개원일</dt>
              <dd className="text-gray-900">{formatDate(data.edate)}</dd>
            </>
          )}
          {data.pbnttmng && (
            <>
              <dt className="text-gray-500">통학차량</dt>
              <dd className="text-gray-900">{data.pbnttmng}</dd>
            </>
          )}
        </dl>
      </div>

      {/* 학급/원아 현황 */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3">학급/원아 현황</h3>
        <p className="text-xs text-gray-500 mb-2">* 추정치 (공공 데이터 기준)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-300 border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1 text-left">구분</th>
                <th className="border border-gray-300 px-2 py-1 text-right">학급수 (반)</th>
                <th className="border border-gray-300 px-2 py-1 text-right">정원</th>
                <th className="border border-gray-300 px-2 py-1 text-right">현원</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: '만3세', cls: data.clcnt3, cap: data.ag3fpcnt, cur: data.ppcnt3 },
                { label: '만4세', cls: data.clcnt4, cap: data.ag4fpcnt, cur: data.ppcnt4 },
                { label: '만5세', cls: data.clcnt5, cap: data.ag5fpcnt, cur: data.ppcnt5 },
                { label: '혼합', cls: data.mixclcnt, cap: data.mixfpcnt, cur: data.mixppcnt },
                { label: '특수', cls: data.shclcnt, cap: data.spcnfpcnt, cur: data.shppcnt },
              ].map((row) => (
                <tr key={row.label}>
                  <td className="border border-gray-300 px-2 py-1">{row.label}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">{row.cls}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">{row.cap}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">{row.cur}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-50">
                <td className="border border-gray-300 px-2 py-1">합계</td>
                <td className="border border-gray-300 px-2 py-1 text-right">
                  {data.totalClassCount}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right">-</td>
                <td className="border border-gray-300 px-2 py-1 text-right">
                  {data.totalChildCount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 교직원 */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-2">교직원 정보</h3>
        <p className="text-sm text-gray-700">교직원 수: {data.prmstfcnt}명</p>
      </div>

      {/* 길찾기/인쇄 */}
      <div className="p-4 flex gap-2">
        {data.addr && (
          <button
            onClick={() => onOpenDirections(data.addr ?? '')}
            className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 transition"
            aria-label="길찾기"
          >
            길찾기
          </button>
        )}
        <button
          onClick={onPrint}
          className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          aria-label="인쇄"
        >
          인쇄
        </button>
      </div>
    </div>
  );
}
