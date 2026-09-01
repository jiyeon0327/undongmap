const facilityService = require('../services/mapService')
const rankingService = require('../services/rankingService');

async function getFacilities(req, res) {
    const {sidoCode, sigunguCode, dongCode, categoryCode} = req.query;
    const result = await facilityService.getFacilities(sidoCode, sigunguCode, dongCode, categoryCode);
    res.json(result);
}

async function getFacilitiesInfo(req, res) {
    const facilityId = req.params.facilityId;
    const result = await facilityService.getFacilitiesInfo(facilityId);
    res.json(result);
}

async function getFacilitiesRanking(req, res) {
    const { regionCode } = req.query;
    const result = await rankingService.getFacilitiesRanking(regionCode);
    res.json(result);
  }

module.exports = { getFacilities, getFacilitiesInfo, getFacilitiesRanking };