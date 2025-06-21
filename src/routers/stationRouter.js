const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
const { loggedin, ensureRole } = require('../middlewares/identification');

// Get all stations (all roles)
router.get('/', loggedin, stationController.getAllStations);
// Get station by ID (all roles)
router.get('/:id', loggedin, stationController.getStationById);
// Create station (admin only)
router.post('/', loggedin, ensureRole(['admin']), stationController.createStation);
// Update station (admin only)
router.patch('/:id', loggedin, ensureRole(['admin']), stationController.updateStation);
// Delete station (admin only)
router.delete('/:id', loggedin, ensureRole(['admin']), stationController.deleteStation);

module.exports = router;


