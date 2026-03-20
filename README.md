# 유치원 지도 서비스 (Kindergarden Map)

대한민국 유치원알리미 Open API 데이터를 기반으로 전국 유치원 정보를 Kakao Maps에 시각화하는 풀스택 웹 서비스입니다.

## 가정 사항 (Assumptions)

1. **유치원알리미 API 키**: 실제 사용 전 [유치원알리미](https://e-childschoolinfo.moe.go.kr) 에서 API 키를 발급받아야 합니다. 키 없이는 `MOCK_MODE=true`로 개발 진행 가능합니다.
2. **Kakao Maps API 키**: [Kakao Developers](https://developers.kakao.com)에서 JavaScript 앱 키를 발급받아야 합니다.
3. **좌표 데이터**: 유치원알리미 API 응답에 위도/경도 필드(`lttdcdnt`, `lngtcdnt`)가 포함되어 있다고 가정합니다. 일부 유치원은 좌표가 없을 수 있습니다.
4. **API 응답 형식**: 유치원알리미 API가 JSON 형식으로 응답한다고 가정합니다 (API 키 발급 시 JSON 선택).
5. **시군구 코드**: 유치원알리미 API의 시군구 코드와 행정안전부 표준 코드가 일치한다고 가정합니다.

## 기술 스택

- **Backend**: NestJS 10 + TypeScript + Prisma ORM
- **Frontend**: Next.js 14 App Router + TypeScript + Tailwind CSS
- **Database**: PostgreSQL 16
- **지도**: Kakao Maps JavaScript SDK (마커 클러스터링 포함)
- **인프라**: Docker Compose

## 시작하기

### 1. 환경변수 설정

```bash
cp .env.example .env
# .env 파일을 열어 API 키 설정
```

필수 환경변수:
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `KINDERGARTEN_API_KEY`: 유치원알리미 API 키 (없으면 `MOCK_MODE=true` 사용)
- `NEXT_PUBLIC_KAKAO_MAP_KEY`: Kakao Maps JavaScript 키

### 2. Docker로 실행

```bash
docker-compose up -d
```

서비스 접속:
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:4000

### 3. 로컬 개발 환경

#### Prerequisites
- Node.js 20+
- PostgreSQL 16
- Yarn (권장)

#### 설치 및 실행

```bash
# 의존성 설치
yarn install

# Prisma 마이그레이션 및 시드 데이터
npx prisma migrate dev --schema=prisma/schema.prisma
npx prisma db seed

# 백엔드 실행 (터미널 1)
yarn dev:backend

# 프론트엔드 실행 (터미널 2)
yarn dev:frontend
```

### 4. 데이터 수집

API 실행 후 관리자 페이지 또는 API로 수집 시작:

```bash
# MOCK_MODE로 테스트 (API 키 없이)
MOCK_MODE=true

# 실제 수집 (전체)
curl -X POST http://localhost:4000/api/admin/sync \
  -H "Content-Type: application/json" \
  -d '{"jobType": "full"}'

# 특정 시도만 수집
curl -X POST http://localhost:4000/api/admin/sync \
  -H "Content-Type: application/json" \
  -d '{"jobType": "sido", "targetCode": "11"}'
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/kindergartens | 유치원 목록 검색 (bounds + 필터) |
| GET | /api/kindergartens/:kinderCode | 유치원 상세 정보 |
| GET | /api/regions/sido | 시도 목록 |
| GET | /api/regions/sgg?sidoCode=11 | 시군구 목록 |
| POST | /api/admin/sync | 데이터 동기화 시작 |
| GET | /api/admin/sync/jobs | 동기화 작업 이력 |

## 주의사항

- 유치원알리미 API는 호출 간 300ms 이상 대기를 요구합니다 (IP 차단 방지)
- 전수 수집 시 약 40-60분 소요 예상 (전국 약 8,000-9,000개 유치원)
- 본 서비스는 유치원알리미(e-childschoolinfo.moe.go.kr) 공공데이터를 활용합니다. 상업적 이용 전 이용조건을 확인하세요.
