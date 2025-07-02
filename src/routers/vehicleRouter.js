const express = require('express');
const router = express.Router();

const { loggedin, ensureRole } = require('../middlewares/identification');
const { isProvider } = require('../middlewares/roleMiddleware');
const { checkVehicleOwnership } = require('../middlewares/ownershipMiddleware'); // Import middleware mới
const { handleValidationErrors } = require('../middlewares/validationHandler');
const { validateVehicleCreation, validateVehicleUpdate } = require('../validators/vehicleValidator');
const vehicleController = require('../controllers/vehicleController');
const imageUploader = require('../middlewares/imageUpload');

const authAccess = [loggedin, ensureRole(['admin', 'provider']), isProvider];

// Các route có ID sẽ cần kiểm tra quyền sở hữu
const ownershipCheckAccess = [...authAccess, checkVehicleOwnership];

// Get all vehicles
router.get('/', authAccess, vehicleController.getAllVehicles);

// Create vehicle
router.post(
  '/', 
  authAccess,
  imageUploader.uploadImage('image'),
  // validateVehicleCreation,
  // handleValidationErrors,
  vehicleController.createVehicle
);

// Get vehicle by ID
router.get('/:id', ownershipCheckAccess, vehicleController.getVehicleById);

// Update vehicle
router.patch(
  '/:id', 
  ownershipCheckAccess, // Sử dụng chuỗi middleware đã bao gồm check ownership
  imageUploader.uploadImage('image'),
  // validateVehicleUpdate,
  // handleValidationErrors,
  vehicleController.updateVehicle
);

// Delete vehicle
router.delete('/:id', ownershipCheckAccess, vehicleController.deleteVehicle);
    
module.exports = router;