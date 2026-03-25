import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { MapBounds } from '@/lib/types';

export type { MarkerData } from './KakaoMap';

const KakaoMap = dynamic(() => import('./KakaoMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <LoadingSpinner message="지도를 불러오는 중..." />
    </div>
  ),
});

interface MarkerData {
  kinderCode: string;
  kindername: string;
  lttdcdnt: number;
  lngtcdnt: number;
  establish: string;
  totalChildCount: number;
  markerType?: 'kindergarten' | 'childcare';
}

interface MapWrapperProps {
  markers: MarkerData[];
  selectedMarkerId: string | null;
  onMarkerClick: (kinderCode: string) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  isLoading: boolean;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <KakaoMap {...props} />;
}
