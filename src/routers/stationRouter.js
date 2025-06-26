const express = require('express');
const router = express.Router();

// --- Imports ---
const stationController = require('../controllers/stationController');
const { loggedin, ensureRole } = require('../middlewares/identification');
const { isProvider } = require('../middlewares/roleMiddleware');
const { handleValidationErrors } = require('../middlewares/validationHandler');
const { validateStationCreation, validateStationUpdate } = require('../validators/stationValidator');
const { checkStationOwnership } = require('../middlewares/ownershipMiddleware');


// --- Middleware chung ---
// isProvider sẽ chạy sau ensureRole, đảm bảo req.provider tồn tại cho vai trò 'provider'
const providerAccess = [loggedin, ensureRole(['admin', 'provider']), isProvider];

/**
 * @route   GET /api/stations
 * @desc    Lấy danh sách bến xe (Provider chỉ thấy bến xe chung + của mình)
 * @access  Private (All authenticated roles)
 */
router.get('/', loggedin, isProvider, stationController.getAllStations);

/**
 * @route   GET /api/stations/:id
 * @desc    Lấy chi tiết 1 bến xe
 * @access  Private (All authenticated roles)
 */
router.get('/:id', loggedin, stationController.getStationById);

/**
 * @route   POST /api/stations
 * @desc    Tạo 1 bến xe mới (Admin tạo main_station, Provider tạo pickup_point)
 * @access  Private (Admin, Provider)
 */
router.post(
    '/',
    providerAccess,
    validateStationCreation,
    handleValidationErrors,
    stationController.createStation
);

/**
 * @route   PATCH /api/stations/:id
 * @desc    Cập nhật 1 bến xe (Provider chỉ được cập nhật bến xe của mình)
 * @access  Private (Admin, Provider)
 */
router.patch(
    '/:id',
    providerAccess,
    checkStationOwnership,
    validateStationUpdate,
    handleValidationErrors,
    stationController.updateStation
);

/**
 * @route   DELETE /api/stations/:id
 * @desc    Xóa 1 bến xe (Provider chỉ được xóa bến xe của mình)
 * @access  Private (Admin, Provider)
 */
router.delete(
    '/:id',
    providerAccess,
    checkStationOwnership,
    stationController.deleteStation
);
module.exports = router;