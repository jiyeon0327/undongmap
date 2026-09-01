//라우터는 주소를 받기만 하고, level/parentCode를 꺼내 서비스에 넘긴 뒤 JSON으로 응답하는 일은 컨트롤러가 한다.
//컨트롤러는 http만 다루고, 어떤 옵션을 줄지는 서비스가 한다. 데이터가 파일이든 샘플이든 이 함수 인터페이스는 그대로이다.

const filterService = require('../services/filterService');

// 쿼리에서 필터 조건을 꺼내 서비스에 넘기고, 결과를 JSON으로 응답한다.
async function getFilterOptions(req, res) {
    const {level, parentCode} = req.query;
    const result = await filterService.getFilterOptions(level, parentCode);
    res.json(result);
}

module.exports = { getFilterOptions };