const express = require('express');
const router = express.Router();
const { loggedin, ensureRole } = require('../middlewares/identification');
const vehicleController = require('../controllers/vehicleController');
const { uploadImage } = require('../middlewares/imageUpload');

// Get all vehicles (admin, provider)
router.get('/', loggedin, ensureRole(['admin', 'provider']), vehicleController.getAllVehicles);
// Get vehicle by ID
router.get('/:id', loggedin, ensureRole(['admin', 'provider']), vehicleController.getVehicleById);
// Create vehicle
router.post('/', loggedin, uploadImage , ensureRole(['admin', 'provider']), vehicleController.createVehicle);
// Update vehicle
router.patch('/:id', loggedin, uploadImage, ensureRole(['admin', 'provider']), vehicleController.updateVehicle);
// Delete vehicle
router.delete('/:id', loggedin, ensureRole(['admin', 'provider']), vehicleController.deleteVehicle);
    
module.exports = router;