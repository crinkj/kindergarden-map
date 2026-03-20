# Kindergarden Map — 공유 컨텍스트

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| DB | PostgreSQL 16 + Prisma ORM |
| Backend | NestJS 10, TypeScript strict |
| Frontend | Next.js 14 App Router, TypeScript strict |
| 지도 | Kakao Maps JavaScript SDK (clusterer) |
| 스타일 | Tailwind CSS 3 |
| 데이터 페칭 | SWR (프론트엔드) |
| 컨테이너 | Docker Compose |

## 폴더 소유권

- `prisma/` — DB 스키마 및 시드
- `backend/src/` — NestJS 앱
- `frontend/src/` — Next.js 앱

## 핵심 규칙

1. TypeScript `any` 금지 — strict 타입만 사용
2. 차트/지도 컴포넌트는 반드시 `'use client'` + `dynamic(... { ssr: false })`
3. Kakao Maps SDK는 `window.kakao.maps.load()` 콜백 안에서만 사용
4. 외부 API 호출 간 최소 300ms 대기 (rate limit)
5. DB 쓰기는 반드시 `prisma.kindergarten.upsert` (kinderCode 기준)

## 환경변수

- `.env.example` 참고
- `MOCK_MODE=true` → 실제 API 호출 없이 mock 데이터 5개 반환
- `NEXT_PUBLIC_KAKAO_MAP_KEY` 필수 (프론트엔드 지도)
- `KINDERGARTEN_API_KEY` 필수 (ETL 수집, MOCK_MODE=false 시)

## 데이터 출처 고지

본 서비스는 유치원알리미(e-childschoolinfo.moe.go.kr) 공공데이터를 활용합니다.
상업적 이용 전 이용조건을 확인하세요.

## API 엔드포인트 요약

- `GET /api/kindergartens` — bounds + 필터 검색
- `GET /api/kindergartens/:kinderCode` — 상세 조회
- `GET /api/regions/sido` — 시도 목록
- `GET /api/regions/sgg?sidoCode=` — 시군구 목록
- `POST /api/admin/sync` — 수집 시작
- `GET /api/admin/sync/jobs` — 수집 이력
