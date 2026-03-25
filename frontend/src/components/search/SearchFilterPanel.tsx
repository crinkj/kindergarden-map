'use client';

import { SidoItem, SggItem } from '@/lib/types';
import { ESTABLISH_TYPES } from '@/lib/constants';

type FacilityMode = 'kindergarten' | 'childcare';

const CHILDCARE_TYPES = [
  { value: '', label: '전체 유형' },
  { value: '국공립', label: '국공립' },
  { value: '민간', label: '민간' },
  { value: '가정', label: '가정' },
  { value: '법인', label: '법인' },
  { value: '직장', label: '직장' },
  { value: '협동', label: '협동' },
];

interface SearchFilterPanelProps {
  facilityMode: FacilityMode;

  keyword: string;
  onKeywordChange: (value: string) => void;

  sidoCode: string;
  sggCode: string;
  onSidoChange: (code: string) => void;
  onSggChange: (code: string) => void;
  sidoList: SidoItem[];
  sggList: SggItem[];

  establish: string;
  onEstablishChange: (value: string) => void;

  crtype: string;
  onCrtypeChange: (value: string) => void;

  minChildren: string;
  maxChildren: string;
  onMinChildrenChange: (value: string) => void;
  onMaxChildrenChange: (value: string) => void;

  rankingMode: boolean;
  onRankingModeChange: (value: boolean) => void;

  hasOpertime: boolean;
  onHasOpertimeChange: (value: boolean) => void;
  hasHomepage: boolean;
  onHasHomepageChange: (value: boolean) => void;

  onReset: () => void;
  onExcelDownload: () => void;
  isLoading: boolean;
  isError: boolean;
}

export default function SearchFilterPanel({
  facilityMode,
  keyword,
  onKeywordChange,
  sidoCode,
  sggCode,
  onSidoChange,
  onSggChange,
  sidoList,
  sggList,
  establish,
  onEstablishChange,
  crtype,
  onCrtypeChange,
  minChildren,
  maxChildren,
  onMinChildrenChange,
  onMaxChildrenChange,
  rankingMode,
  onRankingModeChange,
  hasOpertime,
  onHasOpertimeChange,
  hasHomepage,
  onHasHomepageChange,
  onReset,
  onExcelDownload,
  isLoading,
  isError,
}: SearchFilterPanelProps) {
  const inputClass =
    'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const isKinder = facilityMode === 'kindergarten';

  return (
    <div className="flex flex-col gap-4 p-4">
      {isError && (
        <div className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">
          필터 로드 실패. 새로고침을 시도해 주세요.
        </div>
      )}

      {/* 검색어 */}
      <div>
        <label htmlFor="keyword-input" className="mb-1 block text-xs font-medium text-gray-700">
          {isKinder ? '유치원명 검색' : '어린이집명 검색'}
        </label>
        <input
          id="keyword-input"
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder={isKinder ? '유치원 이름 입력...' : '어린이집 이름 입력...'}
          className={inputClass}
          aria-label={isKinder ? '유치원명 검색' : '어린이집명 검색'}
          disabled={isLoading}
        />
      </div>

      {/* 시도 선택 */}
      <div>
        <label htmlFor="sido-select" className="mb-1 block text-xs font-medium text-gray-700">
          시도
        </label>
        <select
          id="sido-select"
          value={sidoCode}
          onChange={(e) => {
            onSidoChange(e.target.value);
            onSggChange('');
          }}
          className={inputClass}
          aria-label="시도 선택"
          disabled={isLoading}
        >
          <option value="">전체 시도</option>
          {sidoList.map((sido) => (
            <option key={sido.code} value={sido.code}>
              {sido.name}
            </option>
          ))}
        </select>
      </div>

      {/* 시군구 선택 */}
      <div>
        <label htmlFor="sgg-select" className="mb-1 block text-xs font-medium text-gray-700">
          시군구
        </label>
        <select
          id="sgg-select"
          value={sggCode}
          onChange={(e) => onSggChange(e.target.value)}
          className={inputClass}
          aria-label="시군구 선택"
          disabled={isLoading || !sidoCode}
        >
          <option value="">전체 시군구</option>
          {sggList.map((sgg) => (
            <option key={sgg.sggCode} value={sgg.sggCode}>
              {sgg.name}
            </option>
          ))}
        </select>
      </div>

      {/* 설립유형 (유치원만) */}
      {isKinder && (
        <div>
          <label htmlFor="establish-select" className="mb-1 block text-xs font-medium text-gray-700">
            설립유형
          </label>
          <select
            id="establish-select"
            value={establish}
            onChange={(e) => onEstablishChange(e.target.value)}
            className={inputClass}
            aria-label="설립유형 선택"
            disabled={isLoading}
          >
            {ESTABLISH_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 유형 (어린이집만) */}
      {!isKinder && (
        <div>
          <label htmlFor="crtype-select" className="mb-1 block text-xs font-medium text-gray-700">
            유형
          </label>
          <select
            id="crtype-select"
            value={crtype}
            onChange={(e) => onCrtypeChange(e.target.value)}
            className={inputClass}
            aria-label="유형 선택"
            disabled={isLoading}
          >
            {CHILDCARE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 원아 수 범위 */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">원아 수</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minChildren}
            onChange={(e) => onMinChildrenChange(e.target.value)}
            placeholder="최소"
            className={inputClass + ' w-full'}
            disabled={isLoading}
          />
          <span className="text-gray-400 text-xs flex-shrink-0">~</span>
          <input
            type="number"
            min={0}
            value={maxChildren}
            onChange={(e) => onMaxChildrenChange(e.target.value)}
            placeholder="최대"
            className={inputClass + ' w-full'}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* 랭킹 모드 (유치원만) */}
      {isKinder && (sidoCode || sggCode) && (
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={rankingMode}
            onChange={(e) => onRankingModeChange(e.target.checked)}
            className="rounded border-gray-300"
            disabled={isLoading}
          />
          원아 수 순위 보기
        </label>
      )}

      {/* 부가 필터 (유치원만) */}
      {isKinder && (
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={hasOpertime}
              onChange={(e) => onHasOpertimeChange(e.target.checked)}
              className="rounded border-gray-300"
              disabled={isLoading}
            />
            운영시간 정보 있음
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={hasHomepage}
              onChange={(e) => onHasHomepageChange(e.target.checked)}
              className="rounded border-gray-300"
              disabled={isLoading}
            />
            홈페이지 있음
          </label>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onExcelDownload}
          className="w-full rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 transition"
          disabled={isLoading}
        >
          엑셀 다운로드
        </button>
        <button
          onClick={onReset}
          className="w-full rounded bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 transition"
          aria-label="필터 초기화"
          disabled={isLoading}
        >
          필터 초기화
        </button>
      </div>
    </div>
  );
}
