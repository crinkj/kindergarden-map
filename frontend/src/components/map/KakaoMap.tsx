'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useKakaoMap, KakaoMap as KakaoMapInstance, KakaoMarker } from '@/hooks/useKakaoMap';
import { MapBounds } from '@/lib/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_LEVEL } from '@/lib/constants';

interface MarkerData {
  kinderCode: string;
  kindername: string;
  lttdcdnt: number;
  lngtcdnt: number;
  establish: string;
  totalChildCount: number;
}

interface KakaoMapProps {
  markers: MarkerData[];
  selectedMarkerId: string | null;
  onMarkerClick: (kinderCode: string) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  isLoading: boolean;
}

export default function KakaoMap({
  markers,
  selectedMarkerId,
  onMarkerClick,
  onBoundsChange,
  isLoading,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const clustererRef = useRef<{
    addMarkers: (markers: KakaoMarker[]) => void;
    clear: () => void;
  } | null>(null);
  const markerMapRef = useRef<Map<string, KakaoMarker>>(new Map());
  const infoWindowRef = useRef<{
    open: (map: KakaoMapInstance, marker: KakaoMarker) => void;
    close: () => void;
  } | null>(null);

  const { isLoaded, error } = useKakaoMap();

  const getBoundsFromMap = useCallback((map: KakaoMapInstance): MapBounds => {
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    return {
      swLat: sw.getLat(),
      swLng: sw.getLng(),
      neLat: ne.getLat(),
      neLng: ne.getLng(),
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    const kakao = window.kakao;
    const center = new kakao.maps.LatLng(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng);
    const map = new kakao.maps.Map(containerRef.current, {
      center,
      level: DEFAULT_MAP_LEVEL,
    });

    mapRef.current = map;

    // Clusterer
    const clusterer = new kakao.maps.MarkerClusterer({
      map,
      averageCenter: true,
      minLevel: 5,
    });
    clustererRef.current = clusterer;

    // InfoWindow
    infoWindowRef.current = new kakao.maps.InfoWindow({ content: '' });

    // Bounds change listener
    kakao.maps.event.addListener(map, 'idle', () => {
      onBoundsChange(getBoundsFromMap(map));
    });

    // Initial bounds
    onBoundsChange(getBoundsFromMap(map));

    return () => {
      clusterer.clear();
    };
  }, [isLoaded, getBoundsFromMap, onBoundsChange]);

  // Update markers
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !clustererRef.current) return;

    const kakao = window.kakao;
    const map = mapRef.current;
    const clusterer = clustererRef.current;

    // Remove old markers
    markerMapRef.current.forEach((marker) => marker.setMap(null));
    markerMapRef.current.clear();
    clusterer.clear();

    const newMarkers: KakaoMarker[] = [];

    for (const data of markers) {
      if (data.lttdcdnt === null || data.lngtcdnt === null) continue;

      const position = new kakao.maps.LatLng(data.lttdcdnt, data.lngtcdnt);
      const marker = new kakao.maps.Marker({ position });

      markerMapRef.current.set(data.kinderCode, marker);

      kakao.maps.event.addListener(marker, 'click', () => {
        onMarkerClick(data.kinderCode);

        if (infoWindowRef.current) {
          const content = `
            <div style="padding:6px 10px;font-size:13px;min-width:120px;">
              <strong>${data.kindername}</strong>
              <br />
              <span style="color:#4B5563;">원아 ${data.totalChildCount}명</span>
            </div>
          `;
          infoWindowRef.current.close();
          const iw = new kakao.maps.InfoWindow({ content });
          infoWindowRef.current = iw;
          iw.open(map, marker);
        }
      });

      newMarkers.push(marker);
    }

    clusterer.addMarkers(newMarkers);
  }, [isLoaded, markers, onMarkerClick]);

  // Highlight selected marker
  useEffect(() => {
    // Visual selection feedback is handled by the list panel
    // Kakao Maps standard markers don't support easy color changes without custom images
  }, [selectedMarkerId]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <p className="text-sm text-red-600">지도 로드 실패: {error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <LoadingSpinner message="지도를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {isLoading && (
        <div className="absolute right-3 top-3 rounded bg-white px-3 py-2 shadow-md">
          <LoadingSpinner size="sm" message="마커 로드 중..." />
        </div>
      )}
    </div>
  );
}
