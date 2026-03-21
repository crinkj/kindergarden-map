'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import ThreePanelLayout from '@/components/layout/ThreePanelLayout';
import MapWrapper from '@/components/map/MapWrapper';
import SearchFilterPanel from '@/components/search/SearchFilterPanel';
import KindergartenList from '@/components/search/KindergartenList';
import RegionRanking from '@/components/search/RegionRanking';
import KindergartenDetail from '@/components/detail/KindergartenDetail';
import DataDisclaimer from '@/components/common/DataDisclaimer';
import { useKindergartens } from '@/hooks/useKindergartens';
import { useMapBounds } from '@/hooks/useMapBounds';
import { useFavorites } from '@/hooks/useFavorites';
import { KindergartenListItem, KindergartenDetail as KindergartenDetailType, SidoItem, SggItem, MapBounds } from '@/lib/types';
import { swrFetcher, fetchSggList } from '@/lib/api';

export default function HomePage() {
  // Filter state
  const [keyword, setKeyword] = useState('');
  const [sidoCode, setSidoCode] = useState('');
  const [sggCode, setSggCode] = useState('');
  const [establish, setEstablish] = useState('');
  const [minChildren, setMinChildren] = useState('');
  const [maxChildren, setMaxChildren] = useState('');
  const [rankingMode, setRankingMode] = useState(false);
  const [listTab, setListTab] = useState<'list' | 'region'>('list');
  const [hasOpertime, setHasOpertime] = useState(false);
  const [hasHomepage, setHasHomepage] = useState(false);
  const [page, setPage] = useState(1);

  // Selected kindergarten
  const [selectedKinderCode, setSelectedKinderCode] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<KindergartenDetailType | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);

  // Map bounds
  const { bounds, updateBounds } = useMapBounds(500);

  // Favorites
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  // Fetch sido list
  const { data: sidoData } = useSWR<{ data: SidoItem[] }>(
    '/api/regions/sido',
    swrFetcher as (url: string) => Promise<{ data: SidoItem[] }>,
  );

  // Fetch sgg list when sido selected
  const [sggList, setSggList] = useState<SggItem[]>([]);
  useEffect(() => {
    if (!sidoCode) {
      setSggList([]);
      return;
    }
    fetchSggList(sidoCode)
      .then((res) => setSggList(res.data))
      .catch(() => setSggList([]));
  }, [sidoCode]);

  // Ranking mode: sort by children when region selected
  const effectiveSortBy = rankingMode ? 'children' : undefined;

  // Fetch kindergartens
  const effectiveBounds: MapBounds | null = bounds;
  const { data, isLoading, isError } = useKindergartens(
    {
      keyword, sidoCode, sggCode, establish,
      minChildren: minChildren ? Number(minChildren) : undefined,
      maxChildren: maxChildren ? Number(maxChildren) : undefined,
      sortBy: effectiveSortBy,
      page,
    },
    effectiveBounds,
  );

  const items: KindergartenListItem[] = data?.data ?? [];
  const meta = data?.meta;
  const isEmpty = !isLoading && !isError && items.length === 0 && Boolean(bounds || keyword || sidoCode);

  // Fetch detail on marker/item click
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  const handleSelect = useCallback(
    async (kinderCode: string) => {
      setSelectedKinderCode(kinderCode);
      setDetailLoading(true);
      setDetailError(false);
      try {
        const res = await fetch(`${API_BASE}/api/kindergartens/${kinderCode}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const d = (await res.json()) as KindergartenDetailType;
        setDetailData(d);
      } catch {
        setDetailError(true);
        setDetailData(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [API_BASE],
  );

  const handleReset = useCallback(() => {
    setKeyword('');
    setSidoCode('');
    setSggCode('');
    setEstablish('');
    setMinChildren('');
    setMaxChildren('');
    setRankingMode(false);
    setListTab('list');
    setHasOpertime(false);
    setHasHomepage(false);
    setPage(1);
  }, []);

  const handleExcelDownload = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (sidoCode) params.set('sidoCode', sidoCode);
    if (sggCode) params.set('sggCode', sggCode);
    if (establish) params.set('establish', establish);
    if (minChildren) params.set('minChildren', minChildren);
    if (maxChildren) params.set('maxChildren', maxChildren);
    if (effectiveSortBy) params.set('sortBy', effectiveSortBy);
    params.set('format', 'csv');
    params.set('limit', '500');
    const url = `${API_BASE}/api/kindergartens?${params.toString()}`;
    window.open(url, '_blank');
  }, [keyword, sidoCode, sggCode, establish, minChildren, maxChildren, effectiveSortBy, API_BASE]);

  const handleOpenDirections = useCallback((addr: string) => {
    const url = `https://map.kakao.com/link/search/${encodeURIComponent(addr)}`;
    window.open(url, '_blank', 'noopener noreferrer');
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const markers = items
    .filter((item) => item.lttdcdnt !== null && item.lngtcdnt !== null)
    .map((item) => ({
      kinderCode: item.kinderCode,
      kindername: item.kindername,
      lttdcdnt: item.lttdcdnt as number,
      lngtcdnt: item.lngtcdnt as number,
      establish: item.establish ?? '',
      totalChildCount: item.totalChildCount,
    }));

  const filterPanel = (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-900">유치원 지도</h1>
        <p className="text-xs text-gray-500 mt-0.5">전국 유치원 검색</p>
      </div>
      <div className="flex-shrink-0">
        <SearchFilterPanel
          keyword={keyword}
          onKeywordChange={(v) => { setKeyword(v); setPage(1); }}
          sidoCode={sidoCode}
          sggCode={sggCode}
          onSidoChange={(v) => { setSidoCode(v); setRankingMode(false); setPage(1); }}
          onSggChange={(v) => { setSggCode(v); setPage(1); }}
          sidoList={sidoData?.data ?? []}
          sggList={sggList}
          establish={establish}
          onEstablishChange={(v) => { setEstablish(v); setPage(1); }}
          minChildren={minChildren}
          maxChildren={maxChildren}
          onMinChildrenChange={(v) => { setMinChildren(v); setPage(1); }}
          onMaxChildrenChange={(v) => { setMaxChildren(v); setPage(1); }}
          rankingMode={rankingMode}
          onRankingModeChange={(v) => { setRankingMode(v); setPage(1); }}
          hasOpertime={hasOpertime}
          onHasOpertimeChange={setHasOpertime}
          hasHomepage={hasHomepage}
          onHasHomepageChange={setHasHomepage}
          onReset={handleReset}
          onExcelDownload={handleExcelDownload}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* 탭 */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setListTab('list')}
            className={`flex-1 py-2 text-xs font-medium transition ${listTab === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {meta ? `유치원 목록 ${meta.total.toLocaleString()}개` : '유치원 목록'}
          </button>
          <button
            onClick={() => setListTab('region')}
            className={`flex-1 py-2 text-xs font-medium transition ${listTab === 'region' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            지역별 순위
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {listTab === 'list' ? (
            <KindergartenList
              items={items}
              selectedKinderCode={selectedKinderCode}
              onSelectItem={handleSelect}
              currentPage={page}
              totalPages={meta?.totalPages ?? 1}
              onPageChange={setPage}
              isLoading={isLoading}
              isError={isError}
              isEmpty={isEmpty}
              rankingMode={rankingMode}
              pageOffset={(page - 1) * 100}
            />
          ) : (
            <RegionRanking
              sidoCode={sidoCode}
              onSelectSgg={(code) => { setSggCode(code); setListTab('list'); setPage(1); }}
            />
          )}
        </div>
      </div>
    </div>
  );

  const mapPanel = (
    <MapWrapper
      markers={markers}
      selectedMarkerId={selectedKinderCode}
      onMarkerClick={handleSelect}
      onBoundsChange={updateBounds}
      isLoading={isLoading}
    />
  );

  const detailPanel = (
    <KindergartenDetail
      data={detailData}
      isFavorite={selectedKinderCode ? isFavorite(selectedKinderCode) : false}
      onToggleFavorite={toggleFavorite}
      onOpenDirections={handleOpenDirections}
      onPrint={handlePrint}
      isLoading={detailLoading}
      isError={detailError}
    />
  );

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0 no-print">
        <DataDisclaimer />
      </div>
      <div className="flex-1 overflow-hidden">
        <ThreePanelLayout
          filterPanel={filterPanel}
          mapPanel={mapPanel}
          detailPanel={detailPanel}
        />
      </div>
    </div>
  );
}
