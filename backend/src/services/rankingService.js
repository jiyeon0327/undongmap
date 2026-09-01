const { getRedis } = require('./redisClient');
const filterData = require('../data/filterData.json');

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toKstHourBucket(date) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const year = kst.getUTCFullYear();
  const month = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kst.getUTCDate()).padStart(2, '0');
  const hour = String(kst.getUTCHours()).padStart(2, '0');
  return `${year}${month}${day}${hour}`;
}

function getRankingKey(regionCode, date) {
  return `ranking:${regionCode}:${toKstHourBucket(date)}`;
}

function getRecentHourKeys(regionCode) {
  const now = new Date();
  return [0, 1, 2].map((hoursAgo) => {
    const bucketDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    return getRankingKey(regionCode, bucketDate);
  });
}

async function increaseViewCount(facility) {
  const redis = await getRedis();
  const rankingKey = getRankingKey(facility.sigunguCode, new Date());

  await redis.zIncrBy(rankingKey, 1, facility.facilityId);
  await redis.expire(rankingKey, 4 * 60 * 60);
  await redis.set(`facility:name:${facility.facilityId}`, facility.name);
}

async function getFacilitiesRanking(regionCode) {
  if (!regionCode) {
    throw createHttpError(400, 'regionCode가 필요합니다.');
  }

  const sigungu = filterData.sigungu.find((row) => row.code === regionCode);
  if (!sigungu) {
    throw createHttpError(400, 'regionCode가 올바르지 않습니다.');
  }

  const redis = await getRedis();
  const hourKeys = getRecentHourKeys(regionCode);
  const unionKey = `ranking:union:${regionCode}:${Date.now()}`;

  await redis.zUnionStore(unionKey, hourKeys, { AGGREGATE: 'SUM' });
  const rawRanking = await redis.sendCommand([
    'ZREVRANGE',
    unionKey,
    '0',
    '9',
    'WITHSCORES',
  ]);
  await redis.del(unionKey);
  const rows = [];
  for (let i = 0; i < rawRanking.length; i += 2) {
    rows.push({
      value: rawRanking[i],
      score: Number(rawRanking[i + 1]),
    });
  }

  const ranking = [];
  for (let index = 0; index < rows.length; index += 1) {
    const facilityId = rows[index].value;
    const name = await redis.get(`facility:name:${facilityId}`);
    ranking.push({
      rank: index + 1,
      facilityId,
      name: name || '',
      viewCount: rows[index].score,
    });
  }

  return {
    regionCode,
    updatedAt: new Date().toISOString(),
    ranking,
  };
}

module.exports = { increaseViewCount, getFacilitiesRanking };