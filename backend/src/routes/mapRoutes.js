const express = require('express');
const mapController = require('../controllers/mapController');

const router = express.Router();

router.get('/facilities', mapController.getFacilities);
router.get('/facilities/ranking', mapController.getFacilitiesRanking);
router.get('/facilities/:facilityId', mapController.getFacilitiesInfo)

module.exports = router;