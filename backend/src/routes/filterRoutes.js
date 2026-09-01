// 기능별로 라우터를 나누는데, 이 파일은 주소만 담당하고, 실제 로직은 컨트롤러로 넘긴다.
const express = require('express');
const filterController = require('../controllers/filterController');

const router = express.Router();

//GET /api/filters/options - 지역/카테고리 필터 옵션 조회
router.get('/options', filterController.getFilterOptions);

module.exports = router;