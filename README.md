# undongmap

카카오맵 기반으로 사용자가 선택한 지역의 운동시설을 보여주고, 지역별 실시간 인기 순위(Top 10)를 제공하는 서비스이다.

- Backend: Node.js + Express (`backend/`)
- Frontend: React + Vite + Ant Design (`frontend/`)
- DB: Redis
- Server: 카페24

Node.js **20.19+** 또는 **22.12+** 가 필요하다. (Vite 8 요구사항)

## 실행 순서

Redis → 백엔드 → 프론트 순으로 켠다. Redis는 `.env`에 주소만 적혀 있을 뿐, 백엔드가 자동으로 켜 주지 않는다.

### 1. Redis

```bash
docker run -d --name undongmap-redis -p 6379:6379 redis:7
docker start undongmap-redis   # 이미 만든 경우
docker exec undongmap-redis redis-cli ping   # PONG이면 성공
```

### 2. 백엔드

`backend/.env` (참고: `backend/.env.example`)

```
PORT=3000
KAKAO_REST_API_KEY=카카오_REST_키
REDIS_URL=redis://127.0.0.1:6379
```

```bash
cd backend
npm install
npm run dev
```

서버: `http://localhost:3000`  
헬스 체크: `GET /health`

### 3. 프론트엔드

카카오 개발자 콘솔에서 같은 앱의 **JavaScript 키**를 쓰고, Web 사이트 도메인에 `http://localhost:5173`을 등록한다. 제품에서 카카오맵을 켠다. REST 키와 JS 키는 다르다.

`frontend/.env`

```
VITE_KAKAO_JS_KEY=카카오_자바스크립트_키
```

```bash
cd frontend
npm install
npm run dev
```

앱: `http://localhost:5173`

## 화면 흐름

1. 지역 선택: 시/도 → 시/군/구 → 동(선택)
2. 지도: 마커, 카테고리 필터, 시설 상세 말풍선, 인기 순위

카테고리 목록은 `backend/src/data/filterData.json`에서 오고, 프론트는 API로 받아 그린다.

## API

| 용도 | 메서드 | 경로 | 주요 파라미터 |
|------|--------|------|----------------|
| 필터 옵션 | GET | `/api/filters/options` | `level` (`sido` / `sigungu` / `dong` / `category`), 구·동은 `parentCode` |
| 시설 목록(지도) | GET | `/api/facilities` | 필수 `sidoCode`, `sigunguCode` / 선택 `dongCode`, `categoryCode` |
| 시설 상세 | GET | `/api/facilities/{facilityId}` | 목록 조회 후 호출. 조회 수가 올라 순위에 반영된다 |
| 인기 순위 | GET | `/api/facilities/ranking` | `regionCode` (시/군/구 코드) |

카카오 로컬 검색 API는 이름·전화·좌표는 주지만 **영업시간은 제공하지 않는다.** 상세 페이지는 `https://place.map.kakao.com/{facilityId}` 로 연결할 수 있다.
