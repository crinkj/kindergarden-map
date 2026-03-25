'use client';

import { ChildcareDetail as ChildcareDetailType } from '@/lib/types';
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

interface ChildcareDetailProps {
  data: ChildcareDetailType | null;
  onOpenDirections: (addr: string) => void;
  onPrint: () => void;
  isLoading: boolean;
  isError: boolean;
}

export default function ChildcareDetail({
  data,
  onOpenDirections,
  onPrint,
  isLoading,
  isError,
}: ChildcareDetailProps) {
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
        title="선택된 어린이집이 없습니다"
        description="지도에서 마커를 클릭하거나 목록에서 어린이집을 선택하세요."
      />
    );
  }

  const typeKey = data.crtypename?.replace(/어린이집$/, '').trim() ?? '';
  const badgeClass = TYPE_BADGE_COLORS[typeKey] ?? 'bg-gray-300 text-gray-700';
  const updatedDate = new Date(data.updatedAt).toLocaleDateString('ko-KR', {
    year: '2-digit', month: '2-digit', day: '2-digit',
  });

  return (
    <div className="h-full overflow-y-auto">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-xl font-bold text-gray-900 flex-1">{data.crname}</h2>
          <button
            onClick={onPrint}
            aria-label="인쇄"
            className="text-sm text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            🖨
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {data.crtypename && (
            <span className={`text-xs px-2 py-1 rounded ${badgeClass}`}>
              {data.crtypename}
            </span>
          )}
          {data.crstatusname && data.crstatusname !== '정상' && (
            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
              {data.crstatusname}
            </span>
          )}
          <span className="text-xs text-gray-400">업데이트: {updatedDate}</span>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3">기본 정보</h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
          {data.craddr && (
            <>
              <dt className="text-gray-500 whitespace-nowrap">주소</dt>
              <dd className="text-gray-900 flex items-start gap-1">
                <span className="flex-1">{data.craddr}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(data.craddr ?? '').catch(() => {})}
                  className="text-xs text-blue-600 hover:underline flex-shrink-0"
                  aria-label="주소 복사"
                >
                  복사
                </button>
              </dd>
            </>
          )}
          {data.crtelno && (
            <>
              <dt className="text-gray-500">전화</dt>
              <dd>
                <a href={`tel:${data.crtelno}`} className="text-blue-600 hover:underline">
                  {data.crtelno}
                </a>
              </dd>
            </>
          )}
          {data.crfaxno && (
            <>
              <dt className="text-gray-500">팩스</dt>
              <dd className="text-gray-900">{data.crfaxno}</dd>
            </>
          )}
          {data.crhome && (
            <>
              <dt className="text-gray-500">홈페이지</dt>
              <dd>
                <a
                  href={data.crhome}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  바로가기
                </a>
              </dd>
            </>
          )}
          {data.frstcnfmdt && (
            <>
              <dt className="text-gray-500">인가일</dt>
              <dd className="text-gray-900">{data.frstcnfmdt}</dd>
            </>
          )}
        </dl>
      </div>

      {/* 정원/현원 */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3">정원/현원</h3>
        <div className="flex gap-4">
          <div className="flex-1 bg-blue-50 rounded p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">정원</p>
            <p className="text-2xl font-bold text-blue-600">{data.crcapat.toLocaleString()}</p>
            <p className="text-xs text-gray-500">명</p>
          </div>
          <div className="flex-1 bg-green-50 rounded p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">현원</p>
            <p className="text-2xl font-bold text-green-600">{data.crchcnt.toLocaleString()}</p>
            <p className="text-xs text-gray-500">명</p>
          </div>
          {data.crcapat > 0 && (
            <div className="flex-1 bg-gray-50 rounded p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">충원율</p>
              <p className="text-2xl font-bold text-gray-700">
                {Math.round((data.crchcnt / data.crcapat) * 100)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 시설 정보 */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3">시설 정보</h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
          <dt className="text-gray-500">보육실 수</dt>
          <dd className="text-gray-900">{data.nrtrroomcnt}개</dd>
          <dt className="text-gray-500">CCTV</dt>
          <dd className="text-gray-900">{data.cctvinstlcnt}대</dd>
          <dt className="text-gray-500">통학차량</dt>
          <dd className="text-gray-900">{data.chcrtescnt}대</dd>
          {data.crspec && (
            <>
              <dt className="text-gray-500">특징</dt>
              <dd className="text-gray-900">{data.crspec}</dd>
            </>
          )}
        </dl>
      </div>

      {/* 길찾기/인쇄 */}
      <div className="p-4 flex gap-2">
        {data.craddr && (
          <button
            onClick={() => onOpenDirections(data.craddr ?? '')}
            className="flex-1 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 transition"
          >
            길찾기
          </button>
        )}
        <button
          onClick={onPrint}
          className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          인쇄
        </button>
      </div>
    </div>
  );
}
