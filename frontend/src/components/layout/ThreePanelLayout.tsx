'use client';

import { ReactNode, useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';
type SheetHeight = 'collapsed' | 'half' | 'full';

interface ThreePanelLayoutProps {
  filterPanel: ReactNode;
  mapPanel: ReactNode;
  detailPanel: ReactNode;
}

function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const update = (): void => {
      const w = window.innerWidth;
      if (w < 768) setBreakpoint('mobile');
      else if (w < 1024) setBreakpoint('tablet');
      else setBreakpoint('desktop');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return breakpoint;
}

const sheetHeightMap: Record<SheetHeight, string> = {
  collapsed: 'h-[60px]',
  half: 'h-[50%]',
  full: 'h-[90%]',
};

export default function ThreePanelLayout({
  filterPanel,
  mapPanel,
  detailPanel,
}: ThreePanelLayoutProps) {
  const breakpoint = useBreakpoint();
  const [sheetHeight, setSheetHeight] = useState<SheetHeight>('collapsed');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  if (breakpoint === 'desktop') {
    return (
      <div className="flex h-full w-full overflow-hidden">
        {/* Left panel */}
        <aside className="w-[340px] flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
          {filterPanel}
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          {mapPanel}
        </main>

        {/* Right panel */}
        <aside className="w-[380px] flex-shrink-0 bg-white border-l border-gray-200 overflow-hidden flex flex-col">
          {detailPanel}
        </aside>
      </div>
    );
  }

  if (breakpoint === 'tablet') {
    return (
      <div className="relative h-full w-full overflow-hidden">
        {/* Map fills screen */}
        <div className="absolute inset-0">{mapPanel}</div>

        {/* Filter drawer toggle */}
        <button
          onClick={() => setShowFilterDrawer((v) => !v)}
          className="absolute top-3 left-3 z-20 rounded bg-white px-3 py-2 text-sm shadow-md border border-gray-200"
          aria-label="검색/필터 열기"
        >
          {showFilterDrawer ? '닫기' : '검색/필터'}
        </button>

        {/* Filter drawer overlay */}
        {showFilterDrawer && (
          <div className="absolute left-0 top-0 z-10 h-full w-[320px] bg-white shadow-lg overflow-y-auto">
            {filterPanel}
          </div>
        )}

        {/* Detail overlay (bottom sheet) */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-10 bg-white shadow-2xl rounded-t-xl transition-all overflow-hidden ${sheetHeightMap[sheetHeight]}`}
        >
          <div className="flex justify-center pt-2 pb-1">
            <button
              className="w-10 h-1 rounded-full bg-gray-300"
              onClick={() => {
                setSheetHeight((h) =>
                  h === 'collapsed' ? 'half' : h === 'half' ? 'full' : 'collapsed',
                );
              }}
              aria-label="시트 높이 조절"
            />
          </div>
          {detailPanel}
        </div>
      </div>
    );
  }

  // Mobile
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0">{mapPanel}</div>

      {/* FAB for search */}
      <button
        onClick={() => setSheetHeight((h) => (h === 'full' ? 'collapsed' : 'full'))}
        className="absolute top-3 right-3 z-20 rounded-full bg-blue-600 p-3 shadow-lg text-white"
        aria-label="검색 열기"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Bottom sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 bg-white shadow-2xl rounded-t-xl transition-all overflow-hidden ${sheetHeightMap[sheetHeight]}`}
      >
        <div className="flex justify-center pt-2 pb-1">
          <button
            className="w-10 h-1 rounded-full bg-gray-300"
            onClick={() => {
              setSheetHeight((h) =>
                h === 'collapsed' ? 'half' : h === 'half' ? 'full' : 'collapsed',
              );
            }}
            aria-label="시트 높이 조절"
          />
        </div>
        <div className="overflow-y-auto h-full">
          {sheetHeight === 'full' ? detailPanel : filterPanel}
        </div>
      </div>
    </div>
  );
}
