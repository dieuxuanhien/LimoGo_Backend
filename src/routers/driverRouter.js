const express = require('express');
const router = express.Router();
const { uploadImage } = require('../middlewares/imageUpload');
const { loggedin, ensureRole } = require('../middlewares/identification');
const driverController = require('../controllers/driverController');

// Get all drivers (admin, provider)
router.get('/', loggedin, ensureRole(['admin', 'provider']), driverController.getAllDrivers);
// Get driver by ID
router.get('/:id', loggedin, ensureRole(['admin', 'provider']), driverController.getDriverById);
// Create driver
router.post('/', loggedin, ensureRole(['admin', 'provider']), uploadImage, driverController.createDriver);
// Update driver
router.patch('/:id', loggedin, ensureRole(['admin', 'provider']), uploadImage, driverController.updateDriver);
// Delete driver
router.delete('/:id', loggedin, ensureRole(['admin', 'provider']), driverController.deleteDriver);
// Get all drivers for current provider
router.get('/current-provider/all', loggedin, ensureRole(['provider']), driverController.getDriverByCurrentProvider);

module.exports = router;

