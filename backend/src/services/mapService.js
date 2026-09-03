const filterData = require('../data/filterData.json');
const { setFacilityCache, getFacility } = require('./facilityCache');


const KAKAO_KEYWORD_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';
const MAX_FACILITY_COUNT = 45;
const SEARCH_RADIUS_METERS = 2000;

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function findByCode(rows, code) {
  return rows.find((row) => row.code === code);
}

function assertValidMapRequest(sidoCode, sigunguCode, dongCode, categoryCode) {
  if (!sidoCode || !sigunguCode) {
    throw createHttpError(400, 'sidoCode와 sigunguCode는 필수입니다.');
  }
  if (!categoryCode) {
    throw createHttpError(400, 'categoryCode는 필수입니다.');
  }

  const sido = findByCode(filterData.sido, sidoCode);
  const sigungu = findByCode(filterData.sigungu, sigunguCode);

  if (!sido || !sigungu) {
    throw createHttpError(400, '지역 코드가 올바르지 않습니다.');
  }
  if (sigungu.parentCode !== sidoCode) {
    throw createHttpError(400, '시/군/구가 시/도에 속하지 않습니다.');
  }

  let dong = null;
  if (dongCode) {
    dong = findByCode(filterData.dong, dongCode);
    if (!dong || dong.parentCode !== sigunguCode) {
      throw createHttpError(400, '동 코드가 올바르지 않습니다.');
    }
  }

  const category = findByCode(filterData.category, categoryCode);
  if (!category) {
    throw createHttpError(400, 'categoryCode가 올바르지 않습니다.');
  }

  return { sido, sigungu, dong, category };
}

function buildRegionName(sido, sigungu, dong) {
  const names = [sido.name, sigungu.name];
  if (dong) {
    names.push(dong.name);
  }
  return names.join(' ');
}

async function searchKakaoFacilities(query, longitude, latitude) {
  const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;
  if (!kakaoRestApiKey) {
    throw createHttpError(500, 'KAKAO_REST_API_KEY가 설정되지 않았습니다.');
  }

  const places = [];

  // 카카오는 페이지당 최대 15건, 노출 가능 최대 45건
  for (let page = 1; page <= 3; page += 1) {
    const requestUrl = new URL(KAKAO_KEYWORD_SEARCH_URL);
    requestUrl.searchParams.set('query', query);
    requestUrl.searchParams.set('x', String(longitude));
    requestUrl.searchParams.set('y', String(latitude));
    requestUrl.searchParams.set('radius', String(SEARCH_RADIUS_METERS));
    requestUrl.searchParams.set('size', '15');
    requestUrl.searchParams.set('page', String(page));
    requestUrl.searchParams.set('sort', 'distance');

    const kakaoResponse = await fetch(requestUrl, {
      headers: { Authorization: `KakaoAK ${kakaoRestApiKey}` },
    });

    if (!kakaoResponse.ok) {
      throw createHttpError(502, '카카오 시설 검색에 실패했습니다.');
    }

    const kakaoResult = await kakaoResponse.json();
    places.push(...kakaoResult.documents);

    if (kakaoResult.meta.is_end) {
      break;
    }
  }

  return places.slice(0, MAX_FACILITY_COUNT);
}

// 카카오가 준 상세 URL을 쓰고, 없으면 장소 ID로 상세 페이지를 만든다
function buildPlaceUrl(place) {
  if (place.place_url) {
    return place.place_url;
  }
  if (place.id) {
    return `https://place.map.kakao.com/${place.id}`;
  }
  return null;
}

function toFacility(place, categoryCode) {
  return {
    facilityId: place.id,
    name: place.place_name,
    phone: place.phone ? place.phone : null,
    placeUrl: buildPlaceUrl(place),
    categoryCode,
    lat: Number(place.y),
    lng: Number(place.x),
  };
}

function toFacilityDetail(place, categoryCode, sigunguCode) {
  return {
    facilityId: place.id,
    name: place.place_name,
    phone: place.phone ? place.phone : null,
    placeUrl: buildPlaceUrl(place),
    categoryCode,
    sigunguCode,
    lat: Number(place.y),
    lng: Number(place.x),
  };
}

async function getFacilities(sidoCode, sigunguCode, dongCode, categoryCode) {
  const { sido, sigungu, dong, category } = assertValidMapRequest(
    sidoCode,
    sigunguCode,
    dongCode,
    categoryCode,
  );

  // 동이 있으면 동 좌표, 없으면 시/군/구 좌표로 검색
  const searchCenter = dong || sigungu;

  const kakaoPlaces = await searchKakaoFacilities(
    category.name,
    searchCenter.longitude,
    searchCenter.latitude,
  );

  const selectedCategoryCode = category.code;
  const facilities = kakaoPlaces.map((place) => {
    setFacilityCache(place.id, toFacilityDetail(place, selectedCategoryCode, sigungu.code));
    return toFacility(place, selectedCategoryCode);
  });

  return {
    regionName: buildRegionName(sido, sigungu, dong),
    totalCount: facilities.length,
    facilities,
  };
}

const { increaseViewCount } = require('./rankingService');

async function getFacilitiesInfo(facilityId) {
  if (!facilityId) {
    throw createHttpError(400, 'facilityId가 필요합니다.');
  }

  const facility = getFacility(facilityId);
  if (!facility) {
    throw createHttpError(404, '시설 정보를 찾을 수 없습니다. 목록을 다시 조회하세요.');
  }

  await increaseViewCount(facility);
  return facility;
}

module.exports = { getFacilities, getFacilitiesInfo};