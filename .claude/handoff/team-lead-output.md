# Team Lead Output --- 2026-03-20 00:40

## 작업 목표

대한민국 유치원알리미 Open API 데이터를 수집/저장하고, Kakao Maps 기반 지도 위에 유치원 정보를 시각화하는 풀스택 웹 서비스를 구축한다.

## 범위 (In-scope)

- 유치원알리미 Open API ETL 파이프라인 (시도/시군구 단위 전수 수집)
- PostgreSQL + Prisma 기반 데이터 저장
- NestJS REST API (검색, 필터, 지역 코드, 동기화 관리)
- Next.js App Router 기반 지도 UI (Kakao Maps SDK)
- Docker Compose 로컬 개발 환경
- 반응형 3-패널 레이아웃 (검색/필터, 지도, 상세정보)

## 범위 외 (Out-of-scope)

- 사용자 인증/회원가입
- 유치원 평가/리뷰 기능
- 실시간 알림
- CI/CD 파이프라인
- 프로덕션 배포 인프라 (AWS/GCP)

---

## A. 폴더 구조

```
kindergarden-map/
├── .claude/
│   └── handoff/
│       └── team-lead-output.md
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── common/
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── interceptors/
│   │   │   │   └── transform.interceptor.ts
│   │   │   └── dto/
│   │   │       └── pagination.dto.ts
│   │   ├── modules/
│   │   │   ├── kindergarten/
│   │   │   │   ├── kindergarten.module.ts
│   │   │   │   ├── kindergarten.controller.ts
│   │   │   │   ├── kindergarten.service.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── search-kindergarten.dto.ts
│   │   │   │   │   └── kindergarten-response.dto.ts
│   │   │   │   └── kindergarten.repository.ts
│   │   │   ├── region/
│   │   │   │   ├── region.module.ts
│   │   │   │   ├── region.controller.ts
│   │   │   │   ├── region.service.ts
│   │   │   │   └── data/
│   │   │   │       └── region-codes.ts
│   │   │   ├── sync/
│   │   │   │   ├── sync.module.ts
│   │   │   │   ├── sync.service.ts
│   │   │   │   └── collector/
│   │   │   │       └── kindergarten-collector.service.ts
│   │   │   └── admin/
│   │   │       ├── admin.module.ts
│   │   │       └── admin.controller.ts
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   ├── test/
│   │   └── app.e2e-spec.ts
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── map/
│   │   │   │   ├── KakaoMap.tsx          (Client Component)
│   │   │   │   ├── MapMarker.tsx         (Client Component)
│   │   │   │   └── MapCluster.tsx        (Client Component)
│   │   │   ├── search/
│   │   │   │   ├── SearchPanel.tsx       (Client Component)
│   │   │   │   ├── FilterControls.tsx    (Client Component)
│   │   │   │   └── KindergartenList.tsx  (Client Component)
│   │   │   ├── detail/
│   │   │   │   ├── DetailPanel.tsx       (Client Component)
│   │   │   │   └── KindergartenInfo.tsx
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       └── ThreePanelLayout.tsx  (Client Component)
│   │   ├── hooks/
│   │   │   ├── useKindergartens.ts
│   │   │   ├── useRegions.ts
│   │   │   └── useMapBounds.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── types.ts
│   │   └── styles/
│   │       └── variables.css
│   ├── public/
│   │   └── favicon.ico
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docker/
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
├── CLAUDE.md
├── package.json              (workspace root)
└── README.md
```

---

## B. DB 스키마 (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Kindergarten {
  id              Int       @id @default(autoincrement())
  kinderCode      String    @unique @map("kinder_code")        // 유치원 고유 코드
  officeedu       String    @map("officeedu")                  // 시도교육청명
  subofficeedu    String    @map("subofficeedu")               // 시군구교육청명
  kindername      String    @map("kindername")                 // 유치원명
  establish       String?   @map("establish")                  // 설립유형 (공립단설, 공립병설, 사립 등)
  edate           String?   @map("edate")                      // 개원일
  odate           String?   @map("odate")                      // 폐원일
  addr            String?   @map("addr")                       // 주소
  telno           String?   @map("telno")                      // 전화번호
  hpaddr          String?   @map("hpaddr")                     // 홈페이지 주소
  opertime        String?   @map("opertime")                   // 운영시간
  clcnt3          Int       @default(0) @map("clcnt3")         // 만3세 학급수
  clcnt4          Int       @default(0) @map("clcnt4")         // 만4세 학급수
  clcnt5          Int       @default(0) @map("clcnt5")         // 만5세 학급수
  mixclcnt        Int       @default(0) @map("mixclcnt")       // 혼합 학급수
  shclcnt         Int       @default(0) @map("shclcnt")        // 특수 학급수
  prmstfcnt       Int       @default(0) @map("prmstfcnt")      // 교직원수
  ag3fpcnt        Int       @default(0) @map("ag3fpcnt")       // 만3세 정원
  ag4fpcnt        Int       @default(0) @map("ag4fpcnt")       // 만4세 정원
  ag5fpcnt        Int       @default(0) @map("ag5fpcnt")       // 만5세 정원
  mixfpcnt        Int       @default(0) @map("mixfpcnt")       // 혼합 정원
  spcnfpcnt       Int       @default(0) @map("spcnfpcnt")      // 특수 정원
  ppcnt3          Int       @default(0) @map("ppcnt3")         // 만3세 현원
  ppcnt4          Int       @default(0) @map("ppcnt4")         // 만4세 현원
  ppcnt5          Int       @default(0) @map("ppcnt5")         // 만5세 현원
  mixppcnt        Int       @default(0) @map("mixppcnt")       // 혼합 현원
  shppcnt         Int       @default(0) @map("shppcnt")        // 특수 현원
  pbnttmng        String?   @map("pbnttmng")                   // 통학차량 운영 여부
  lttdcdnt        Float?    @map("lttdcdnt")                   // 위도 (latitude)
  lngtcdnt        Float?    @map("lngtcdnt")                   // 경도 (longitude)

  // 계산 필드 (ETL 수집 시 계산하여 저장)
  totalClassCount Int       @default(0) @map("total_class_count")  // clcnt3+clcnt4+clcnt5+mixclcnt+shclcnt
  totalChildCount Int       @default(0) @map("total_child_count")  // ppcnt3+ppcnt4+ppcnt5+mixppcnt+shppcnt

  // 지역 코드 (검색/필터용)
  sidoCode        String?   @map("sido_code")
  sggCode         String?   @map("sgg_code")

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  @@index([sidoCode])
  @@index([sggCode])
  @@index([kindername])
  @@index([establish])
  @@index([lttdcdnt, lngtcdnt])
  @@map("kindergartens")
}

model RegionCode {
  id          Int      @id @default(autoincrement())
  sidoCode    String   @map("sido_code")        // 시도 코드
  sidoName    String   @map("sido_name")        // 시도명
  sggCode     String?  @map("sgg_code")         // 시군구 코드
  sggName     String?  @map("sgg_name")         // 시군구명

  @@unique([sidoCode, sggCode])
  @@index([sidoCode])
  @@map("region_codes")
}

model SyncJob {
  id          Int       @id @default(autoincrement())
  status      String    @default("pending") @map("status")     // pending, running, completed, failed
  jobType     String    @default("full") @map("job_type")      // full, sido, sgg
  targetCode  String?   @map("target_code")                    // 특정 지역만 수집 시
  totalCount  Int       @default(0) @map("total_count")        // 수집된 총 건수
  errorCount  Int       @default(0) @map("error_count")
  errorLog    String?   @map("error_log")
  startedAt   DateTime? @map("started_at")
  completedAt DateTime? @map("completed_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  @@map("sync_jobs")
}
```

---

## C. 환경변수 목록 (.env.example)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kindergarden_map?schema=public

# 유치원알리미 Open API
KINDERGARTEN_API_KEY=your_api_key_here

# Kakao Maps
KAKAO_MAP_KEY=your_kakao_rest_api_key
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_javascript_key

# Frontend -> Backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Rate Limiting (외부 API 호출 간격)
API_RATE_LIMIT_MS=300
API_TIMEOUT_MS=10000

# Mock Mode (true면 실제 API 호출 없이 더미 데이터 사용)
MOCK_MODE=false

# General
NODE_ENV=development
PORT=4000
```

---

## D. 백엔드 모듈 구조

### D-1. PrismaModule (`backend/src/prisma/`)

| 파일 | 역할 |
|------|------|
| `prisma.module.ts` | Global 모듈, PrismaService 제공 |
| `prisma.service.ts` | PrismaClient 확장, onModuleInit/onModuleDestroy 생명주기 |

### D-2. KindergartenModule (`backend/src/modules/kindergarten/`)

| 파일 | 역할 |
|------|------|
| `kindergarten.module.ts` | 모듈 정의 |
| `kindergarten.controller.ts` | `GET /api/kindergartens`, `GET /api/kindergartens/:kinderCode` |
| `kindergarten.service.ts` | 검색/필터 비즈니스 로직 |
| `kindergarten.repository.ts` | Prisma 쿼리 빌더 (bounds, 텍스트 검색, 필터 조합) |
| `dto/search-kindergarten.dto.ts` | 쿼리 파라미터 유효성 검증 |
| `dto/kindergarten-response.dto.ts` | 응답 직렬화 |

### D-3. RegionModule (`backend/src/modules/region/`)

| 파일 | 역할 |
|------|------|
| `region.module.ts` | 모듈 정의 |
| `region.controller.ts` | `GET /api/regions/sido`, `GET /api/regions/sgg` |
| `region.service.ts` | 지역 코드 조회 |
| `data/region-codes.ts` | 전국 17개 시도 코드 및 시군구 코드 상수 |

**시도 코드 목록:**

```typescript
export const SIDO_CODES: Record<string, string> = {
  '11': '서울특별시',
  '21': '부산광역시',
  '22': '대구광역시',
  '23': '인천광역시',
  '24': '광주광역시',
  '25': '대전광역시',
  '26': '울산광역시',
  '29': '세종특별자치시',
  '41': '경기도',
  '42': '강원특별자치도',
  '43': '충청북도',
  '44': '충청남도',
  '45': '전북특별자치도',
  '46': '전라남도',
  '47': '경상북도',
  '48': '경상남도',
  '49': '제주특별자치도',
};
```

### D-4. SyncModule (`backend/src/modules/sync/`)

| 파일 | 역할 |
|------|------|
| `sync.module.ts` | 모듈 정의, HttpModule 임포트 |
| `sync.service.ts` | SyncJob 관리 (생성, 상태 업데이트, 조회) |
| `collector/kindergarten-collector.service.ts` | **핵심 ETL 엔진** |

**KindergartenCollectorService 설계:**

```
1. SyncJob 생성 (status: running)
2. 시도 코드 목록 순회
   ├── 시도별 시군구 코드 목록 조회 (region_codes 테이블 또는 상수)
   │   └── 시군구별 API 호출
   │       ├── GET https://e-childschoolinfo.moe.go.kr/api/notice/basicInfo2.do
   │       │   ?key={API_KEY}&sidoCode={sidoCode}&sggCode={sggCode}
   │       ├── 응답 파싱 → Kindergarten 엔티티 매핑
   │       ├── totalClassCount, totalChildCount 계산
   │       ├── sidoCode, sggCode 매핑
   │       ├── prisma.kindergarten.upsert (kinderCode 기준)
   │       └── sleep(API_RATE_LIMIT_MS)   ← 300ms 딜레이
   └── 에러 발생 시 errorCount++, errorLog 누적 (중단하지 않음)
3. SyncJob 완료 (status: completed/failed, totalCount, errorCount)
```

### D-5. AdminModule (`backend/src/modules/admin/`)

| 파일 | 역할 |
|------|------|
| `admin.module.ts` | SyncModule 임포트 |
| `admin.controller.ts` | `POST /api/admin/sync`, `GET /api/admin/sync/jobs` |

---

## E. API 명세

### E-1. GET /api/kindergartens

유치원 목록 검색 (지도 뷰포트 기반 + 필터)

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `swLat` | float | No | 지도 남서쪽 위도 (bounds 검색 시 4개 모두 필수) |
| `swLng` | float | No | 지도 남서쪽 경도 |
| `neLat` | float | No | 지도 북동쪽 위도 |
| `neLng` | float | No | 지도 북동쪽 경도 |
| `keyword` | string | No | 유치원명 검색 (LIKE %keyword%) |
| `sidoCode` | string | No | 시도 코드 필터 |
| `sggCode` | string | No | 시군구 코드 필터 |
| `establish` | string | No | 설립유형 필터 (공립단설, 공립병설, 사립) |
| `page` | int | No | 페이지 번호 (기본 1) |
| `limit` | int | No | 페이지 크기 (기본 100, 최대 500) |

**Response:**

```json
{
  "data": [
    {
      "kinderCode": "12345678",
      "kindername": "OO유치원",
      "establish": "사립",
      "addr": "서울특별시 ...",
      "telno": "02-1234-5678",
      "lttdcdnt": 37.5665,
      "lngtcdnt": 126.978,
      "totalClassCount": 5,
      "totalChildCount": 120,
      "prmstfcnt": 10
    }
  ],
  "meta": {
    "total": 1234,
    "page": 1,
    "limit": 100,
    "totalPages": 13
  }
}
```

### E-2. GET /api/kindergartens/:kinderCode

유치원 상세 정보 조회

**Response:** Kindergarten 모델의 전체 필드

### E-3. POST /api/admin/sync

데이터 동기화 시작

**Request Body:**

```json
{
  "jobType": "full",        // "full" | "sido" | "sgg"
  "targetCode": null         // jobType이 sido/sgg일 때 코드
}
```

**Response:**

```json
{
  "jobId": 1,
  "status": "running",
  "message": "동기화가 시작되었습니다."
}
```

### E-4. GET /api/admin/sync/jobs

동기화 작업 이력 조회

**Query:** `page`, `limit`

**Response:** SyncJob 목록 (최신순)

### E-5. GET /api/regions/sido

시도 목록 조회

**Response:**

```json
{
  "data": [
    { "code": "11", "name": "서울특별시" },
    { "code": "21", "name": "부산광역시" }
  ]
}
```

### E-6. GET /api/regions/sgg

시군구 목록 조회

**Query:** `sidoCode` (필수)

**Response:**

```json
{
  "data": [
    { "sidoCode": "11", "sggCode": "110", "name": "종로구" },
    { "sidoCode": "11", "sggCode": "140", "name": "중구" }
  ]
}
```

---

## F. fullstack-engineer 구현 지시사항

### 구현 우선순위

**Phase 1 --- 인프라 (먼저 구현)**
1. `docker-compose.yml` (PostgreSQL + backend + frontend)
2. `prisma/schema.prisma`
3. `.env.example`
4. `backend/package.json`, `tsconfig.json`, `nest-cli.json`
5. `frontend/package.json`, `next.config.js`, `tailwind.config.ts`
6. Root `package.json` (workspaces)

**Phase 2 --- 백엔드 코어**
1. `backend/src/prisma/` (PrismaService, PrismaModule)
2. `backend/src/main.ts`, `app.module.ts`
3. `backend/src/modules/region/` (시도/시군구 코드)
4. `backend/src/modules/kindergarten/` (CRUD, 검색)
5. `backend/src/modules/sync/` (ETL 수집기)
6. `backend/src/modules/admin/` (수집 트리거)
7. `backend/src/common/` (필터, 인터셉터, DTO)

**Phase 3 --- 프론트엔드**
1. `frontend/src/lib/types.ts`, `api.ts`
2. `frontend/src/app/layout.tsx`, `page.tsx`
3. `frontend/src/components/map/KakaoMap.tsx`
4. `frontend/src/components/search/SearchPanel.tsx`
5. `frontend/src/components/detail/DetailPanel.tsx`
6. `frontend/src/components/layout/ThreePanelLayout.tsx`
7. `frontend/src/hooks/`

### 핵심 비즈니스 로직

**1. Bounds 쿼리 (지도 뷰포트 기반 검색)**

```sql
WHERE lttdcdnt BETWEEN :swLat AND :neLat
  AND lngtcdnt BETWEEN :swLng AND :neLng
```

- 지도 이동/줌 시 debounce 300ms 적용 후 API 호출
- 프론트에서 `map.getBounds()` 호출하여 SW/NE 좌표 전달

**2. ETL Upsert 로직**

```typescript
await prisma.kindergarten.upsert({
  where: { kinderCode: data.kinderCode },
  update: { ...mappedData, updatedAt: new Date() },
  create: { ...mappedData },
});
```

- kinderCode 기준 upsert (새로 생긴 유치원은 insert, 기존은 update)
- totalClassCount = clcnt3 + clcnt4 + clcnt5 + mixclcnt + shclcnt
- totalChildCount = ppcnt3 + ppcnt4 + ppcnt5 + mixppcnt + shppcnt

**3. API 호출 rate limit**

```typescript
// 유치원알리미 API 호출 간 최소 300ms 대기
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 각 API 호출 후
await delay(Number(process.env.API_RATE_LIMIT_MS) || 300);
```

**4. 유치원알리미 API 호출 형식**

```
GET https://e-childschoolinfo.moe.go.kr/api/notice/basicInfo2.do
  ?key={KINDERGARTEN_API_KEY}
  &sidoCode={sidoCode}
  &sggCode={sggCode}
```

- 응답: XML or JSON (key 발급 시 설정에 따라 다름, JSON 권장)
- 한 번 호출 시 해당 시군구의 모든 유치원 반환 (페이지네이션 없음)

### 주의사항

1. **Rate Limit**: 외부 API 호출 간 반드시 300ms 이상 대기. 위반 시 IP 차단 가능.
2. **Upsert**: INSERT 대신 반드시 upsert 사용. 동일 kinderCode 중복 삽입 방지.
3. **좌표 null**: 일부 유치원은 lttdcdnt/lngtcdnt가 null. 지도에 표시하지 않되 목록에는 포함.
4. **에러 내성**: 특정 시군구 수집 실패 시 해당 건만 로깅하고 나머지 계속 진행.
5. **CORS**: 백엔드에서 `http://localhost:3000` 허용 설정 필수.
6. **Pagination**: 기본 limit 100, 최대 500. 프론트에서 무한 스크롤 또는 페이지네이션 구현.
7. **Docker**: PostgreSQL 포트 5432, 백엔드 4000, 프론트엔드 3000.
8. **Kakao Maps SDK**: Script 태그로 로드 (`//dapi.kakao.com/v2/maps/sdk.js?appkey={KEY}&libraries=clusterer`). 반드시 Client Component에서만 사용.

---

## G. product-designer UI 설계 지시사항

### 레이아웃: 3-패널 구조

```
+------------------+----------------------------------+-------------------+
|   좌측 패널       |         중앙: 지도                |   우측 패널       |
|   (320px)        |         (flex: 1)                |   (380px)        |
|                  |                                  |                  |
|  [검색바]         |     [Kakao Map]                  |  [유치원 상세]     |
|  [시도 드롭다운]   |     - 마커 클러스터링              |  - 기본 정보       |
|  [시군구 드롭다운]  |     - 마커 클릭 -> 상세           |  - 학급/원아 현황   |
|  [설립유형 필터]   |     - 현재 뷰포트 기준 검색        |  - 교직원 정보     |
|  [결과 리스트]     |                                  |  - 위치/연락처     |
|  - 유치원명       |                                  |                  |
|  - 주소(1줄)      |                                  |                  |
|  - 원아수/학급수   |                                  |                  |
+------------------+----------------------------------+-------------------+
```

### 모바일 반응형 전략

- **Breakpoint**: 768px
- **모바일**: 지도 전체 화면 + 하단 시트 (검색/목록/상세)
  - 하단 시트 3단계: collapsed(검색바만), half(목록), full(상세)
  - 상단에 검색 아이콘 FAB
- **태블릿 (768-1024px)**: 좌측 패널 + 지도 (우측 패널은 오버레이)
- **데스크톱 (1024px+)**: 3-패널 풀 레이아웃

### 표시 데이터 항목

**목록 카드 (좌측 패널):**
- 유치원명 (`kindername`)
- 설립유형 뱃지 (`establish` - 색상 구분: 공립=파랑, 사립=초록)
- 주소 1줄 (`addr` - overflow ellipsis)
- 원아 수 / 학급 수 (`totalChildCount` / `totalClassCount`)

**상세 패널 (우측):**
- 유치원명, 설립유형
- 주소 전체
- 전화번호 (클릭 시 tel: 링크)
- 홈페이지 (클릭 시 새 탭)
- 운영시간
- 개원일
- 통학차량 유무
- 학급 현황 테이블:

  | 구분 | 학급수 | 정원 | 현원 |
  |------|--------|------|------|
  | 만3세 | clcnt3 | ag3fpcnt | ppcnt3 |
  | 만4세 | clcnt4 | ag4fpcnt | ppcnt4 |
  | 만5세 | clcnt5 | ag5fpcnt | ppcnt5 |
  | 혼합 | mixclcnt | mixfpcnt | mixppcnt |
  | 특수 | shclcnt | spcnfpcnt | shppcnt |
  | **합계** | **totalClassCount** | - | **totalChildCount** |

- 교직원 수 (`prmstfcnt`)

### 지도 마커

- 기본 마커: 유치원 위치 핀
- 클러스터링: 줌 레벨에 따라 근접 마커 그룹화 (Kakao Maps clusterer 라이브러리)
- 마커 클릭 시: 우측 상세 패널 열림 + 해당 항목 좌측 리스트에서 하이라이트
- 인포윈도우: 유치원명 + 원아수 간략 표시

### 컬러/스타일 가이드

- 색상: Tailwind 기본 팔레트 사용
- 설립유형 뱃지: 공립단설(blue-500), 공립병설(blue-300), 사립(emerald-500)
- 지도 영역: 둥근 모서리 없음 (전체 채움)
- 패널: `bg-white`, `shadow-lg`, `border-r` 또는 `border-l`
- 폰트: system-ui (Pretendard 등 한글 폰트 추가 권장)

---

## 태스크 목록 (우선순위 순)

### [T-01] 프로젝트 초기화 및 인프라 설정
- 담당: fullstack-engineer
- 설명: monorepo 구조 생성, Docker Compose, Prisma 스키마, 환경변수, 패키지 설정
- 완료 기준: `docker-compose up`으로 PostgreSQL 기동, `npx prisma migrate dev` 성공
- 의존: 없음

### [T-02] 백엔드 코어 모듈 구현
- 담당: fullstack-engineer
- 설명: NestJS 앱 부트스트랩, PrismaModule, RegionModule, KindergartenModule (검색/상세 API)
- 완료 기준: 6개 API 엔드포인트 모두 200 응답, bounds 쿼리 정상 동작
- 의존: T-01

### [T-03] ETL 수집기 구현
- 담당: fullstack-engineer
- 설명: KindergartenCollectorService, SyncService, AdminController. 유치원알리미 API 호출 및 upsert
- 완료 기준: `POST /api/admin/sync` 호출 시 1개 시도 이상 정상 수집, SyncJob 상태 추적 동작
- 의존: T-02

### [T-04] 프론트엔드 지도 UI 구현
- 담당: fullstack-engineer (UI 설계는 product-designer 가이드 따름)
- 설명: Next.js App Router 설정, Kakao Maps 통합, 3-패널 레이아웃, 검색/필터, 상세 패널
- 완료 기준: 지도에 마커 표시, 검색/필터 동작, 상세 패널 열림, 반응형 동작
- 의존: T-02

### [T-05] 통합 테스트 및 마무리
- 담당: fullstack-engineer
- 설명: 전체 흐름 테스트 (수집 -> 저장 -> 검색 -> 지도 표시), CORS 설정, 에러 핸들링
- 완료 기준: 로컬 Docker 환경에서 전체 플로우 정상 동작
- 의존: T-03, T-04

---

## 리스크 & 주의사항

- **유치원알리미 API 키 미발급**: API 키가 없으면 수집 불가. MOCK_MODE=true로 개발 진행 가능하도록 mock 데이터 준비 필요.
- **API Rate Limit 위반**: 300ms 미만 간격 호출 시 차단 가능. collector에서 반드시 딜레이 적용.
- **좌표 누락 데이터**: 약 5-10% 유치원은 좌표 없음. null 좌표는 지도에서 제외하되 목록 검색에는 포함.
- **대량 데이터**: 전국 유치원 약 8,000-9,000개. 초기 전수 수집 시 약 40-60분 소요 예상 (300ms * 250개 시군구).
- **Kakao Maps SDK 로딩**: Script 비동기 로딩 필요, SSR 환경에서 window 객체 접근 시 에러 발생 가능. Client Component 필수.

## 데이터 무결성 체크포인트

- [x] Prisma schema에 모든 필드 정의됨
- [x] totalClassCount, totalChildCount 계산 로직 명시됨
- [x] upsert 기준 키 (kinderCode) 명시됨
- [x] 시도 코드 17개 전수 포함
- [x] API 엔드포인트 6개 전체 명세 포함
- [ ] 시군구 코드 전수 목록은 유치원알리미 API 또는 별도 소스에서 수집 필요
