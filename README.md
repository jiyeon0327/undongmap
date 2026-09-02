# undongmap

카카오맵 기반으로 사용자가 선택한 지역의 운동시설을 보여주고, 지역별 실시간 인기 순위 (Top 10)를 제공하는 서비스 시스템 구조이다.

- Backend: Node.js + Express (`backend/`)
- Frontend: React (예정)
- DB: Redis
- Sever: 카페24

## 백엔드 실행

```bash
cd backend
npm install
npm run dev
```

서버 주소: `http://localhost:3000`  
헬스 체크: `GET /health` 

### API 
검색 필터 옵션 조회 API: 	GET	/api/filters/options
맵 표출 API:    GET	/api/facilities
시설 상세 정보 조회 API: GET	/api/facilities/{facilityId}
실시간 인기 검색 순위 API:	GET	/api/facilities/ranking