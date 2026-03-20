# Final Review --- 2026-03-20

## 1. 핵심 파일 존재 여부

| 파일 | 존재 | 비고 |
|------|------|------|
| `prisma/schema.prisma` | O | Kindergarten, RegionCode, SyncJob 3개 모델, 인덱스 5개 |
| `docker-compose.yml` | O | PostgreSQL 16 + backend + frontend, healthcheck 포함 |
| `backend/src/modules/sync/collector/kindergarten-collector.service.ts` | O | 384줄, ETL 엔진 완전 구현 |
| `frontend/src/components/map/KakaoMap.tsx` | O | Client Component, 클러스터링, InfoWindow |
| `backend/src/main.ts` | O | CORS, ValidationPipe, 필터, 인터셉터 |
| `backend/src/app.module.ts` | O | ConfigModule(global), 4개 모듈 임포트 |
| `.env.example` | O | 10개 환경변수 |
| `README.md` | O | 가정사항, 실행방법, API 명세 |
| `prisma/seed.ts` | O | 시드 데이터 |
| `backend/Dockerfile` | O | |
| `frontend/Dockerfile` | O | |

**결과: 필수 파일 모두 존재 --- PASS**

---

## 2. ETL 수집기 검토

### Rate Limit
- `delay(this.rateLimitMs)` 호출 확인 (collector.service.ts:271)
- `rateLimitMs`는 ConfigService에서 `API_RATE_LIMIT_MS` 읽어 기본값 300ms
- **PASS**

### Retry
- `fetchBasicInfo`에서 3회 재시도 + 지수 백오프 구현 (1s, 2s, 4s)
- collector.service.ts:219-237
- **PASS**

### Upsert
- `prisma.kindergarten.upsert({ where: { kinderCode } })` 사용 (collector.service.ts:364)
- `totalClassCount`, `totalChildCount` 계산 후 저장 (collector.service.ts:325-326)
- **PASS**

### MOCK_MODE
- `MOCK_MODE=true`일 때 5개 mock 유치원 데이터 반환 (collector.service.ts:60-147)
- 각 mock 데이터에 모든 필수 필드 포함
- **PASS**

### 에러 내성
- 시군구별 수집 실패 시 errorCount++, failedRegions에 기록 후 계속 진행 (collector.service.ts:281-293)
- 실패 지역은 `logs/failed-regions.json`에 기록
- **PASS**

---

## 3. API 엔드포인트 구현 여부

| # | 엔드포인트 | 구현 파일 | 상태 |
|---|-----------|----------|------|
| 1 | `GET /api/kindergartens` | kindergarten.controller.ts:14-28 | PASS - bounds, keyword, sidoCode, sggCode, establish, page, limit, format(csv) |
| 2 | `GET /api/kindergartens/:kinderCode` | kindergarten.controller.ts:30-33 | PASS |
| 3 | `POST /api/admin/sync` | admin.controller.ts:13-21 | PASS - jobType(full/sido/sgg), targetCode |
| 4 | `GET /api/admin/sync/jobs` | admin.controller.ts:23-29 | PASS - page, limit |
| 5 | `GET /api/regions/sido` | region.controller.ts:8-10 | PASS |
| 6 | `GET /api/regions/sgg` | region.controller.ts:13-19 | PASS - sidoCode 파라미터 |

**추가 구현: CSV export (`?format=csv`) --- 설계 범위 초과이나 유용한 기능**

**결과: 6개 엔드포인트 모두 구현 --- PASS**

---

## 4. 프론트엔드 검토

### 3-패널 레이아웃
- `ThreePanelLayout.tsx`: desktop(3-패널), tablet(지도+사이드+바텀시트), mobile(지도+바텀시트+FAB)
- 좌측 340px, 우측 380px, 중앙 flex-1
- **PASS**

### Kakao Maps
- `KakaoMap.tsx`: Client Component, `window.kakao` 사용
- MarkerClusterer 통합 (`minLevel: 5`)
- InfoWindow (유치원명 + 원아수)
- `idle` 이벤트로 bounds 변경 감지
- **PASS**

### 즐겨찾기
- `useFavorites.ts`: localStorage 기반, toggle/isFavorite
- `KindergartenDetail.tsx`: 하트 아이콘 (67-72줄)
- **PASS**

### CSV Export
- 백엔드 `kindergarten.service.ts:31-33`: `findAllAsCsv` 메서드
- 컨트롤러: `?format=csv` 시 Content-Disposition 헤더 + BOM 포함
- **PASS**

### 추가 기능 (설계 범위 초과, 양호)
- `DataDisclaimer.tsx`: 데이터 출처 고지
- `ErrorBoundary.tsx`: 에러 경계
- `EmptyState.tsx`: 빈 상태 UI
- `useRecentSearches.ts`: 최근 검색 기록
- 길찾기 (Kakao Map 링크), 인쇄, 주소 복사
- 데이터 신선도 표시 (최신/보통/오래됨)
- 관리자 페이지 (`/admin`, `/admin/sync`)

---

## 5. 환경변수 (.env.example) 완성도

| 변수 | 포함 | 비고 |
|------|------|------|
| `DATABASE_URL` | O | |
| `KINDERGARTEN_API_KEY` | O | |
| `KAKAO_MAP_KEY` | O | |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | O | |
| `NEXT_PUBLIC_API_BASE_URL` | O | |
| `API_RATE_LIMIT_MS` | O | 기본 300 |
| `API_TIMEOUT_MS` | O | 기본 10000 |
| `MOCK_MODE` | O | |
| `NODE_ENV` | O | |
| `PORT` | O | |

**결과: 10개 환경변수 모두 포함 --- PASS**

---

## 6. README 완성도

- 가정사항 5개 명시 (API 키, 좌표 데이터, 응답 형식, 시군구 코드)
- 실행방법: Docker Compose + 로컬 개발 환경 모두 기술
- API 명세: 6개 엔드포인트 테이블
- 주의사항: rate limit, 수집 시간, 이용조건
- **PASS**

---

## 7. 보완 필요 사항

### [중요도: 높음]

#### 7-1. SyncService의 sido/sgg 분기 로직 오류
- `sync.service.ts:58-61`에서 `collectAll` 호출 시:
  - `jobType === 'sido'`일 때 `filterSidoCode`에 `targetCode` 전달 --- 정상
  - `jobType === 'sgg'`일 때 `filterSidoCode`와 `filterSggCode` 모두 `targetCode`로 전달 --- **오류**
  - `sgg` 타입에서는 `sidoCode`와 `sggCode`를 별도로 받아야 함. 현재 구조로는 `sgg` 동기화가 정상 동작하지 않음.
- **권장**: `StartSyncBody`에 `sidoCode`와 `sggCode`를 별도 필드로 분리하거나, `targetCode`를 `sidoCode:sggCode` 형식으로 파싱.

#### 7-2. 시군구 코드 데이터 부재
- `region-codes.ts`에 시도 코드 17개만 포함. 시군구 코드 목록 없음.
- `collectAll`에서 `prisma.regionCode.findMany`로 시군구 조회하나, `region_codes` 테이블이 비어 있으면 수집 불가.
- `seed.ts`에서 시군구 데이터를 시딩하거나, 별도 시군구 코드 수집 API/상수가 필요.
- **권장**: `prisma/seed.ts`에 주요 시군구 코드를 시딩하거나, 유치원알리미 시군구 코드 API를 호출하여 자동 수집하는 로직 추가.

### [중요도: 중간]

#### 7-3. CORS 설정에 FRONTEND_URL 누락
- `main.ts:15`에서 `process.env.FRONTEND_URL`을 참조하나, `.env.example`에 해당 변수 없음.
- Docker Compose에서는 `NEXT_PUBLIC_API_BASE_URL`만 설정됨.
- **권장**: `.env.example`에 `FRONTEND_URL=http://localhost:3000` 추가.

#### 7-4. CSV Export 보안
- `GET /api/kindergartens?format=csv`가 인증 없이 전체 데이터 다운로드 가능.
- 현재 범위에서 인증이 out-of-scope이나, 향후 rate limiting 또는 최대 행 수 제한 권장.

#### 7-5. docker-compose.yml에서 Prisma migration 자동 실행 부재
- backend 컨테이너 시작 시 `npx prisma migrate deploy`가 자동 실행되지 않음.
- Dockerfile 또는 entrypoint에서 마이그레이션 실행이 필요.
- **권장**: backend Dockerfile에 `npx prisma migrate deploy` 추가 또는 docker-compose command 오버라이드.

### [중요도: 낮음]

#### 7-6. 프론트엔드 검색 debounce
- `page.tsx:34`에서 `useMapBounds(500)` (500ms debounce) 적용.
- keyword 검색에는 debounce가 없어 타이핑마다 API 호출 가능.
- **권장**: keyword에도 300-500ms debounce 적용.

#### 7-7. XSS 방지 (InfoWindow)
- `KakaoMap.tsx:123-129`에서 `data.kindername`을 innerHTML로 삽입.
- 유치원명은 공공 API 데이터이므로 위험도는 낮으나, 원칙적으로 이스케이프 권장.

---

## 데이터 무결성 체크포인트

- [x] Prisma schema에 설계 문서의 모든 필드 포함
- [x] totalClassCount, totalChildCount 계산 로직 정확 (collector.service.ts:325-326)
- [x] upsert 기준 키 kinderCode 사용
- [x] 시도 코드 17개 전수 포함 (region-codes.ts)
- [x] Mock 데이터에 모든 필수 필드 포함
- [x] API 6개 엔드포인트 모두 구현
- [x] CSV export BOM 포함 (한글 깨짐 방지)
- [x] Client Component 분리 (KakaoMap, ThreePanelLayout, SearchFilterPanel 등)
- [ ] 시군구 코드 시딩 미구현 (7-2)
- [ ] sgg 동기화 분기 로직 수정 필요 (7-1)

---

## 종합 평가

전체 65개 파일 구현 완료. 설계 문서 대비 구현 적합도 높음. ETL, API 6개, 지도 UI, 반응형 레이아웃 모두 정상 구현. 설계 범위를 초과하는 유용한 기능(CSV export, 즐겨찾기, 길찾기, 관리자 페이지)도 추가됨.

**핵심 수정 필요 2건**: (7-1) sgg 동기화 분기 로직, (7-2) 시군구 코드 시딩. 이 두 항목이 해결되면 전수 수집 파이프라인이 정상 동작할 것으로 판단됨.
