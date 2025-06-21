const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { loggedin, ensureRole } = require('../middlewares/identification');

// Get all trips (admin, provider)
router.get('/', loggedin, ensureRole(['admin', 'provider']), tripController.getAllTrips);
// Get trip by ID
router.get('/:id', loggedin, ensureRole(['admin', 'provider']), tripController.getTripById);
// Create trip
router.post('/', loggedin, ensureRole(['admin', 'provider']), tripController.createTrip);
// Update trip
router.patch('/:id', loggedin, ensureRole(['admin', 'provider']), tripController.updateTrip);
// Delete trip
router.delete('/:id', loggedin, ensureRole(['admin', 'provider']), tripController.deleteTrip);

module.exports = router;
