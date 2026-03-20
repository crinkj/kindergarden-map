# Designer Output — 2026-03-20 10:30

## 페이지 구조

### 1. 메인 대시보드 (`/`)

#### 레이아웃
- **데스크톱 (1024px+)**: 3-패널 고정 레이아웃
  - 좌측 패널: 340px (검색/필터)
  - 중앙: flex-1 (지도)
  - 우측 패널: 380px (상세 정보)

- **태블릿 (768-1023px)**: 2-레이어
  - 지도 전체 화면
  - 좌측 패널: 드로어 오버레이 (슬라이드 인/아웃)
  - 우측 패널: 하단 시트 (반투명 오버레이, 높이 조정 가능)

- **모바일 (< 768px)**: 풀스크린 지도 + 하단 시트
  - 지도: 전체 화면
  - 상단 우측: 검색 FAB 버튼
  - 하단 시트: 3단계 높이 (collapsed/half/full)
    - collapsed: 검색바만 (높이 60px)
    - half: 목록 보기 (높이 50%)
    - full: 상세 정보 (높이 90%)

#### 컴포넌트 목록
- **SearchFilterPanel**: 검색 필터 입력 패널
- **KakaoMap**: 지도 렌더링 + 마커 표시
- **KindergartenDetail**: 우측/하단 상세 정보 패널
- **KindergartenList**: 좌측 목록 카드
- **ThreePanelLayout**: 반응형 레이아웃 관리
- **LoadingSpinner**: 데이터 로딩 표시
- **EmptyState**: 검색 결과 없음
- **ErrorBoundary**: 에러 표시

---

## 컴포넌트 스펙

### SearchFilterPanel
**위치**: `frontend/src/components/search/SearchFilterPanel.tsx`

**Props:**
```typescript
{
  // 검색 입력
  keyword: string;
  onKeywordChange: (value: string) => void;

  // 지역 필터
  sidoCode: string;
  sggCode: string;
  onSidoChange: (code: string) => void;
  onSggChange: (code: string) => void;
  sidoList: { code: string; name: string }[];
  sggList: { code: string; name: string }[];

  // 설립유형 필터
  establish: string;
  onEstablishChange: (value: string) => void;

  // 아동 수 범위 필터
  minChildren: number;
  maxChildren: number;
  onMinChildrenChange: (value: number) => void;
  onMaxChildrenChange: (value: number) => void;

  // 학급 수 필터
  minClasses: number;
  maxClasses: number;
  onMinClassesChange: (value: number) => void;
  onMaxClassesChange: (value: number) => void;

  // 운영시간/홈페이지 체크
  hasOpertime: boolean;
  onHasOpertimeChange: (value: boolean) => void;
  hasHomepage: boolean;
  onHasHomepageChange: (value: boolean) => void;

  // 리셋 버튼
  onReset: () => void;

  // 로딩/에러 상태
  isLoading: boolean;
  isError: boolean;
}
```

**상태 처리**:
- loading: 스켈레톤 로더 표시 (Input, Dropdown 영역)
- error: 빨강 배경 알림 "필터 로드 실패"
- empty: "검색 결과 없음" 메시지

**초보자 용어 매핑**:
- "설립유형": 공립(공공) vs 사립(민간)
- "원아 수": 다니는 아이 수
- "학급 수": 반 개수
- "운영시간": 원에서 문을 여는 시간
- "홈페이지": 원 소개 웹사이트

**모바일 (< 768px)**:
- 화면 넓이 100% 드로어
- 스크롤 가능한 컨테이너
- 버튼: 풀 너비

**디자인 토큰**:
- 배경: `bg-white`
- 테두리: `border-r border-gray-200`
- 입력 필드: `border border-gray-300 rounded px-3 py-2`
- 드롭다운: `border border-gray-300 rounded px-3 py-2`
- 슬라이더: Tailwind `range` 또는 shadcn/ui Slider
- 버튼: `bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded`

---

### KakaoMap
**위치**: `frontend/src/components/map/KakaoMap.tsx`

**Props:**
```typescript
{
  // 마커 데이터 (경량)
  markers: Array<{
    kinderCode: string;
    kindername: string;
    lttdcdnt: number;  // 위도
    lngtcdnt: number;  // 경도
    establish: string;
    totalChildCount: number;
  }>;

  // 선택 상태
  selectedMarkerId: string | null;
  onMarkerClick: (kinderCode: string) => void;

  // 지도 bounds 변경 시 콜백
  onBoundsChange: (bounds: {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
  }) => void;

  // 로딩 상태
  isLoading: boolean;
}
```

**마커 표시 규칙**:
- 기본: 유치원 핀 아이콘 (회색)
- 선택됨: 핀 아이콘 (파랑)
- 인포윈도우: 유치원명 + 원아수 ("00원 (000명)")

**클러스터링**:
- Kakao Maps Clusterer 라이브러리 사용
- 줌 레벨별 자동 그룹화
- 클러스터 클릭 시 해당 영역 줌 인

**상태 처리**:
- loading: 마커 로드 중 스피너
- error: "지도 로드 실패" 메시지
- empty: 마커 없음 (검색 결과 없음 상태)

**모바일**:
- 전체 화면 채움
- 터치 제스처 지원 (핀치 줌, 팬)

**디자인 토큰**:
- 지도 배경: Kakao 기본
- 마커 색상: 기본(gray-400), 선택(blue-600)

---

### KindergartenDetail
**위치**: `frontend/src/components/detail/KindergartenDetail.tsx`

**Props:**
```typescript
{
  // 상세 정보 데이터
  data: Kindergarten | null;

  // 즐겨찾기 상태
  isFavorite: boolean;
  onToggleFavorite: (kinderCode: string) => void;

  // 길찾기 (외부 링크)
  onOpenDirections: (addr: string) => void;

  // 인쇄 기능
  onPrint: () => void;

  // 로딩/에러
  isLoading: boolean;
  isError: boolean;
}
```

**표시 섹션** (순서대로):

1. **헤더**
   - 유치원명 (큰 텍스트, `text-xl font-bold`)
   - 설립유형 뱃지 (공립=`bg-blue-500`, 사립=`bg-emerald-500`)
   - 즐겨찾기 버튼 (하트 아이콘)
   - 인쇄 버튼

2. **기본 정보**
   - 주소 (전체, 복사 버튼)
   - 전화번호 (tel: 링크)
   - 홈페이지 (URL 링크, 새 탭)
   - 운영시간 (텍스트)
   - 개원일 (YYYY-MM-DD)
   - 통학차량 (있음/없음)

3. **학급/원아 현황 (테이블)**
   ```
   | 구분 | 학급수 | 정원 | 현원 |
   |------|--------|------|------|
   | 만3세 | clcnt3 | ag3fpcnt | ppcnt3 |
   | 만4세 | clcnt4 | ag4fpcnt | ppcnt4 |
   | 만5세 | clcnt5 | ag5fpcnt | ppcnt5 |
   | 혼합 | mixclcnt | mixfpcnt | mixppcnt |
   | 특수 | shclcnt | spcnfpcnt | shppcnt |
   | **합계** | **totalClassCount** | - | **totalChildCount** |
   ```
   - 테이블: `border border-gray-300`, 헤더 `bg-gray-100`
   - 숫자: 우측 정렬

4. **교직원 정보**
   - 교직원 수 (`prmstfcnt`)

5. **길찾기/인쇄**
   - 길찾기 버튼 (Kakao Map/Naver Map 링크)
   - 인쇄 버튼

**상태 처리**:
- loading: 스켈레톤 로더 (전체 섹션)
- error: 빨강 알림 "상세 정보 로드 실패"
- empty: "선택된 유치원이 없습니다"

**초보자 용어**:
- "학급수": 반 개수
- "정원": 원래 수용 가능한 아이 수
- "현원": 현재 다니는 아이 수

**모바일**:
- 하단 시트 full 상태에서 스크롤 가능
- 섹션 간 구분선 추가 (`border-t border-gray-200`)

**디자인 토큰**:
- 배경: `bg-white`
- 테두리: `border-l border-gray-200`
- 섹션 제목: `text-lg font-semibold`
- 뱃지: 공립 `bg-blue-500 text-white text-xs px-2 py-1 rounded`, 사립 `bg-emerald-500`
- 버튼: `bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded text-sm`

---

### KindergartenList
**위치**: `frontend/src/components/search/KindergartenList.tsx`

**Props:**
```typescript
{
  // 목록 데이터
  items: Array<{
    kinderCode: string;
    kindername: string;
    establish: string;
    addr: string;
    totalClassCount: number;
    totalChildCount: number;
  }>;

  // 선택 상태
  selectedKinderCode: string | null;
  onSelectItem: (kinderCode: string) => void;

  // 페이지네이션
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  // 로딩/에러
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
}
```

**카드 레이아웃** (각 항목):
- 유치원명 (bold, `text-base`)
- 설립유형 뱃지 (공립=`bg-blue-300`, 사립=`bg-emerald-300`, 작은 폰트)
- 주소 (1줄, `text-sm text-gray-600`, ellipsis)
- 하단 우측: 원아수/학급수 ("000명 / 0학급", 작은 폰트, 우측 정렬)

**카드 스타일**:
- `border border-gray-200 rounded px-3 py-2 mb-2 cursor-pointer hover:bg-blue-50`
- 선택됨: `border-blue-600 bg-blue-50 border-2`

**페이지네이션**:
- 하단: "< 이전 | 1 2 3 ... | 다음 >"
- 버튼: `bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-1 rounded text-sm`

**상태 처리**:
- loading: 스켈레톤 카드 3개
- error: 빨강 알림 "목록 로드 실패"
- isEmpty: "검색 결과가 없습니다"

**모바일**:
- 카드 풀 너비
- 스크롤 가능 (fixed height container)

**디자인 토큰**:
- 배경: `bg-white`
- 호버: `hover:bg-blue-50 transition`

---

### ThreePanelLayout
**위치**: `frontend/src/components/layout/ThreePanelLayout.tsx`

**Props:**
```typescript
{
  // 자식 컴포넌트
  filterPanel: React.ReactNode;
  mapPanel: React.ReactNode;
  detailPanel: React.ReactNode;

  // 반응형 상태
  breakpoint: 'mobile' | 'tablet' | 'desktop';

  // 모바일 시트 상태
  sheetHeight: 'collapsed' | 'half' | 'full';
  onSheetHeightChange: (height: 'collapsed' | 'half' | 'full') => void;
}
```

**기본 동작**:
- 창 리사이징 감지 → `breakpoint` 업데이트
- 모바일에서 하단 시트 드래그 → `sheetHeight` 업데이트 (debounce 100ms)

**CSS 클래스**:
- 데스크톱: `flex gap-0` (3-패널)
- 태블릿: `relative` (오버레이 레이아웃)
- 모바일: `relative h-screen` (풀스크린 + 시트)

---

### LoadingSpinner
**위치**: `frontend/src/components/common/LoadingSpinner.tsx`

**Props:**
```typescript
{
  size?: 'sm' | 'md' | 'lg';  // 기본: 'md'
  message?: string;            // 로딩 텍스트
}
```

**디자인**:
- SVG 스핀 애니메이션 또는 shadcn/ui Skeleton
- 색상: `text-blue-600`
- 메시지: `text-sm text-gray-600`

---

### EmptyState
**위치**: `frontend/src/components/common/EmptyState.tsx`

**Props:**
```typescript
{
  title: string;
  description?: string;
  icon?: React.ReactNode;
}
```

**디자인**:
- 아이콘 (검색, 지도 등)
- 제목 (bold)
- 설명 (회색, 작은 폰트)
- 센터 정렬

---

### ErrorBoundary
**위치**: `frontend/src/components/common/ErrorBoundary.tsx`

**Props:**
```typescript
{
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}
```

**기본 표시**:
- 빨강 배경 `bg-red-50`
- 아이콘 + "오류가 발생했습니다"
- 재시도 버튼

---

## 상태 관리 설계

### URL Searchparams 동기화
```typescript
// URL에 필터 상태 저장 (SEO + 뒤로가기)
const params = new URLSearchParams({
  keyword: searchParams.keyword || '',
  sidoCode: searchParams.sidoCode || '',
  sggCode: searchParams.sggCode || '',
  establish: searchParams.establish || '',
  page: searchParams.page || '1',
});

router.push(`/?${params.toString()}`);
```

**장점**:
- 검색 결과 URL 공유 가능
- 브라우저 뒤로/앞으로 버튼 지원
- 새로고침 시 상태 복구

---

### 지도 Bounds 변경 감지
```typescript
// debounce 500ms 적용
const handleBoundsChange = debounce((bounds) => {
  // API 호출
  fetchKindergartens({
    swLat: bounds.getSouthWest().getLat(),
    swLng: bounds.getSouthWest().getLng(),
    neLat: bounds.getNorthEast().getLat(),
    neLng: bounds.getNorthEast().getLng(),
  });
}, 500);

map.addEventListener('idle', handleBoundsChange);
```

**목적**: 사용자가 지도를 이동할 때마다 API를 과다 호출하지 않음

---

### 즐겨찾기 (localStorage)
```typescript
// kinderCode 배열로 저장
const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
favorites.push(kinderCode);
localStorage.setItem('favorites', JSON.stringify([...new Set(favorites)]));
```

**UI**:
- 하트 아이콘 (채움/속빔)
- 클릭 시 즉시 반영
- 새로고침 후에도 유지

---

### 최근 검색 (localStorage)
```typescript
// 최근 5개 검색 조건 저장
const searches = [
  { keyword, sidoCode, sggCode, establish, timestamp: Date.now() },
  ...existingSearches,
].slice(0, 5);
localStorage.setItem('recentSearches', JSON.stringify(searches));
```

**UI**:
- 검색 필터 아래 "최근 검색" 드롭다운
- 클릭 시 조건 복구

---

## API 연동 패턴

### 1. 마커 데이터 경량화
```typescript
// API 응답: lat/lng/kinderCode/kindername만
GET /api/kindergartens?swLat=...&swLng=...&neLat=...&neLng=...

Response:
{
  "data": [
    {
      "kinderCode": "12345678",
      "kindername": "OO유치원",
      "lttdcdnt": 37.5,
      "lngtcdnt": 126.97,
      "establish": "사립",
      "totalChildCount": 120
    }
  ],
  "meta": { "total": 250, "page": 1, "limit": 1000 }
}
```

---

### 2. 상세 정보 조회
```typescript
// 마커 클릭 시 호출
GET /api/kindergartens/:kinderCode

Response: Kindergarten 전체 필드
```

---

### 3. SWR 캐싱 설정
```typescript
const { data, error, isLoading } = useSWR(
  keyword || bounds ? `/api/kindergartens?${queryString}` : null,
  fetcher,
  {
    dedupingInterval: 5000,    // 5초 내 중복 요청 제거
    focusThrottleInterval: 30000, // 30초마다 재검증
  }
);
```

---

## 색상 & 디자인 토큰

### Primary Colors
- **Primary**: `#2563EB` (파란색 - 신뢰감)
  - Tailwind: `blue-600`
  - hover: `blue-700`

### Establishment Badge Colors
- **공립단설**: `#3B82F6` (blue-500)
- **공립병설**: `#93C5FD` (blue-300)
- **사립**: `#10B981` (emerald-500)

### Background & Layout
- **페이지 배경**: `#F8FAFC` (slate-50)
- **카드 배경**: `#FFFFFF` (white)
- **패널 테두리**: `#E2E8F0` (gray-200)

### Text Colors
- **제목**: `#1F2937` (gray-900)
- **본문**: `#4B5563` (gray-700)
- **보조 텍스트**: `#9CA3AF` (gray-400)
- **에러**: `#DC2626` (red-600)

### Status Colors
- **로딩**: `#2563EB` (blue-600)
- **성공**: `#10B981` (green-600)
- **실패**: `#DC2626` (red-600)
- **경고**: `#F59E0B` (amber-500)

### Typography
- **폰트 패밀리**: system-ui, Pretendard (한글)
- **제목 (h1)**: `text-2xl font-bold`
- **제목 (h2)**: `text-xl font-semibold`
- **본문**: `text-base`
- **보조 텍스트**: `text-sm text-gray-600`

---

## shadcn/ui 활용 컴포넌트

| 컴포넌트 | 용도 | 위치 |
|---------|------|------|
| **Card** | 패널 래퍼, 카드 컨테이너 | SearchPanel, DetailPanel, ListItem |
| **Badge** | 설립유형, 상태 표시 | ListItem, DetailPanel 헤더 |
| **Tooltip** | 마우스 호버 도움말 | 버튼, 아이콘 |
| **Skeleton** | 로딩 상태 | SearchPanel, DetailPanel, List |
| **Alert** | 에러/경고 메시지 | 전역, 에러 경계 |
| **Button** | 클릭 액션 | 모든 곳 |
| **Input** | 검색, 필터 입력 | SearchPanel |
| **Select** | 드롭다운 선택 | 시도/시군구, 설립유형 |
| **Table** | 학급/원아 현황 | DetailPanel |

---

## 데이터 상태 배지 규칙

### 모든 숫자 필드 옆에 추가
- `totalClassCount`: *추정치 (데이터 기준: 어제)
- `totalChildCount`: *추정치
- 가격/비용 필드: *참고용 (실제 확인 필수)

### 데이터 신선도 표시
```
업데이트 시각 < 1일: 최신 ✓ (green-600)
업데이트 시각 1-7일: 보통 (gray-600)
업데이트 시각 > 7일: 오래됨 ⚠ (amber-600)
```

---

## 반응형 기준

| 기기 | 너비 | 레이아웃 | 컨테이너 |
|------|------|---------|---------|
| 모바일 | < 768px | 풀스크린 지도 + 하단 시트 | 100% |
| 태블릿 | 768-1023px | 좌측 드로어 + 지도 | 100% |
| 데스크톱 | 1024px+ | 3-패널 고정 | 1400px (max) |

**CSS Breakpoint:**
```css
@media (max-width: 768px) { /* 모바일 */ }
@media (min-width: 768px) and (max-width: 1023px) { /* 태블릿 */ }
@media (min-width: 1024px) { /* 데스크톱 */ }
```

---

## 접근성 가이드

- [ ] 모든 버튼에 `aria-label` 추가
- [ ] 폼 입력에 `<label>` 또는 `aria-label` 연결
- [ ] 색상만으로 정보 표현 금지 (텍스트 + 아이콘)
- [ ] 이미지에 `alt` 텍스트
- [ ] 링크와 버튼 구분 명확
- [ ] 키보드 네비게이션 지원 (Tab, Enter)
- [ ] 포커스 상태 시각적 표시 (outline 또는 ring)
- [ ] 콘트라스트 비율 최소 4.5:1 (WCAG AA)

---

## 성능 최적화

### 이미지 & 자산
- Kakao Maps SDK는 async/defer로 로드
- 마커 아이콘: SVG (작은 크기)
- 클러스터 숫자: 텍스트 (캔버스 안 그리기)

### 번들 최적화
- SearchPanel, DetailPanel: code splitting
- KakaoMap: 동적 import (`next/dynamic`)
- 불필요한 재렌더링 방지 (useMemo, useCallback)

### API 캐싱
- SWR 기본 dedupingInterval: 5초
- stale-while-revalidate: 활성

---

## 완료 체크리스트

- [ ] 모든 컴포넌트 Props 인터페이스 정의됨
- [ ] 색상 토큰 tailwind.config에 등록됨
- [ ] 반응형 breakpoint 명시됨
- [ ] 초보자 용어 매핑 완료
- [ ] 데이터 상태 배지 규칙 정의됨
- [ ] shadcn/ui 활용 컴포넌트 목록 확정됨
- [ ] 접근성 체크리스트 포함됨

---

**설계자**: product-designer
**최종 검토**: 2026-03-20 10:30
**상태**: 완료 ✓
