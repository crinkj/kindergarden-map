'use client';

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (
          container: HTMLElement,
          options: { center: unknown; level: number },
        ) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options: { position: KakaoLatLng; map?: KakaoMap }) => KakaoMarker;
        MarkerClusterer: new (options: {
          map: KakaoMap;
          averageCenter?: boolean;
          minLevel?: number;
        }) => KakaoMarkerClusterer;
        InfoWindow: new (options: { content: string }) => KakaoInfoWindow;
        event: {
          addListener: (target: unknown, type: string, handler: () => void) => void;
          removeListener: (target: unknown, type: string, handler: () => void) => void;
        };
      };
    };
  }
}

export interface KakaoMap {
  getCenter: () => KakaoLatLng;
  getBounds: () => KakaoBounds;
  setCenter: (latLng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
}

export interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

export interface KakaoBounds {
  getSouthWest: () => KakaoLatLng;
  getNorthEast: () => KakaoLatLng;
}

export interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void;
  getPosition: () => KakaoLatLng;
}

export interface KakaoMarkerClusterer {
  addMarkers: (markers: KakaoMarker[]) => void;
  clear: () => void;
}

export interface KakaoInfoWindow {
  open: (map: KakaoMap, marker: KakaoMarker) => void;
  close: () => void;
}

export function useKakaoMap() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!key) {
      setError('NEXT_PUBLIC_KAKAO_MAP_KEY is not configured');
      return;
    }

    if (window.kakao?.maps) {
      window.kakao.maps.load(() => setIsLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=clusterer&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => setIsLoaded(true));
    };
    script.onerror = () => {
      setError('카카오맵 SDK 로드에 실패했습니다.');
    };

    document.head.appendChild(script);
  }, []);

  return { isLoaded, error };
}
