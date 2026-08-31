const express = require('express');
const cors = require('cors');

const app = express();

// 프론트엔드(React)에서 API를 호출할 수 있도록 CORS 허용
app.use(cors());
// JSON 요청 본문을 파싱
app.use(express.json());

// 서버가 살아 있는지 확인하는 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
