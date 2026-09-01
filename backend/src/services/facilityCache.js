const TTL_MS = 5 * 60 * 1000; //5분
const facilityCache = new Map();

function setFacilityCache(facilityId, facility) {
    facilityCache.set(facilityId, {
      facility,
      expiresAt: Date.now() + TTL_MS,
    });
  }

function getFacility(facilityId) {
    const cached = facilityCache.get(facilityId);
    if (!cached) {
      return null;
    }
    if (Date.now() > cached.expiresAt) {
      facilityCache.delete(facilityId);
      return null;
    }
    return cached.facility;
}

module.exports = { setFacilityCache, getFacility };