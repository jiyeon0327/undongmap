const FILTER_LEVELS = ['sido', 'sigungu', 'dong', 'category'];

//전체 지역 목록은 나중에 파일로 분리, 지금은 목록을 고르는 로직을 위해 샘플만 둔다.
const filterData = require('../data/filterData.json');

function assertValidFilterRequest(level, parentCode) {
    if (!FILTER_LEVELS.includes(level)) {
        const error = new Error('level 값이 올바르지 않습니다.');
        error.statusCode = 400;
        throw error;
    }

    const needParentCode = level === 'sigungu' || level === 'dong';
    if (needParentCode && !parentCode) {
        const error = new Error('parentCode 값이 필요합니다.');
        error.statusCode = 400;
        throw error;
    }
}

function getFilterOptions(level, parentCode) {
    assertValidFilterRequest(level, parentCode);


    const rows = filterData[level];
    const matchRows = (level === 'sigungu' || level === 'dong')
        ? rows.filter((row) => row.parentCode === parentCode)
        : rows;

    const options = matchRows.map((row) => ({
        code: row.code,
        name: row.name,
    }));

    return {level, options};
}

module.exports = { getFilterOptions };