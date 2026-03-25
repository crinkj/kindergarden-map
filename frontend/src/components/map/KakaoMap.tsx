'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useKakaoMap, KakaoMap as KakaoMapInstance, KakaoMarker, KakaoMarkerImage, KakaoSize } from '@/hooks/useKakaoMap';
import { MapBounds } from '@/lib/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_LEVEL } from '@/lib/constants';

export interface MarkerData {
  kinderCode: string;
  kindername: string;
  lttdcdnt: number;
  lngtcdnt: number;
  establish: string;
  totalChildCount: number;
  markerType?: 'kindergarten' | 'childcare';
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
  const markerDataRef = useRef<Map<string, MarkerData>>(new Map());
  const selectedMarkerIdRef = useRef<string | null>(null);
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
    markerDataRef.current.clear();
    selectedMarkerIdRef.current = null;
    clusterer.clear();

    const newMarkers: KakaoMarker[] = [];

    for (const data of markers) {
      if (data.lttdcdnt === null || data.lngtcdnt === null) continue;

      const position = new kakao.maps.LatLng(data.lttdcdnt, data.lngtcdnt);

      // Use different marker image for childcare centers (green tint)
      let markerImage: KakaoMarkerImage | undefined;
      if (data.markerType === 'childcare') {
        const imageSize = new kakao.maps.Size(24, 35);
        markerImage = new kakao.maps.MarkerImage(
          'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
          imageSize,
        );
      }

      const marker = new kakao.maps.Marker({ position, image: markerImage });

      markerMapRef.current.set(data.kinderCode, marker);
      markerDataRef.current.set(data.kinderCode, data);

      kakao.maps.event.addListener(marker, 'click', () => {
        onMarkerClick(data.kinderCode);

        if (infoWindowRef.current) {
          const typeLabel = data.markerType === 'childcare' ? '어린이집' : '유치원';
          const childLabel = data.markerType === 'childcare' ? '현원' : '원아';
          const content = `
            <div style="padding:6px 10px;font-size:13px;min-width:120px;">
              <strong>${data.kindername}</strong>
              <br />
              <span style="color:#6B7280;font-size:11px;">${typeLabel}</span>
              <span style="color:#4B5563;"> · ${childLabel} ${data.totalChildCount}명</span>
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

  // Highlight selected marker in red
  useEffect(() => {
    if (!isLoaded) return;

    const kakao = window.kakao;

    const makeImage = (src: string, size: KakaoSize): KakaoMarkerImage => {
      const s = new kakao.maps.Size(size.width, size.height);
      return new kakao.maps.MarkerImage(src, s);
    };

    // Restore previous selected marker
    const prevId = selectedMarkerIdRef.current;
    if (prevId) {
      const prevMarker = markerMapRef.current.get(prevId);
      const prevData = markerDataRef.current.get(prevId);
      if (prevMarker && prevData) {
        if (prevData.markerType === 'childcare') {
          prevMarker.setImage(makeImage(
            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
            { width: 24, height: 35 },
          ));
        } else {
          prevMarker.setImage(null as unknown as KakaoMarkerImage);
        }
      }
    }

    // Highlight new selected marker in red
    if (selectedMarkerId) {
      const marker = markerMapRef.current.get(selectedMarkerId);
      if (marker) {
        marker.setImage(makeImage(
          'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
          { width: 36, height: 36 },
        ));
      }
    }

    selectedMarkerIdRef.current = selectedMarkerId;
  }, [isLoaded, selectedMarkerId]);

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
