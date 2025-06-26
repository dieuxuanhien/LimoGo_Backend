const express = require('express');
const router = express.Router();

// --- Imports ---
const routeController = require('../controllers/routeController');
const { loggedin, ensureRole } = require('../middlewares/identification');
const { isProvider } = require('../middlewares/roleMiddleware');
const { handleValidationErrors } = require('../middlewares/validationHandler');
const { validateRouteCreation, validateRouteUpdate } = require('../validators/routeValidator');
const { checkRouteOwnership } = require('../middlewares/ownershipMiddleware');

// --- Middleware chung ---
const providerAccess = [loggedin, ensureRole(['admin', 'provider']), isProvider];

/**
 * @route   GET /api/routes
 * @desc    Lấy danh sách tuyến đường (Provider thấy tuyến chung + của mình)
 * @access  Private (Admin, Provider)
 */
router.get('/', providerAccess, routeController.getAllRoutes);

/**
 * @route   GET /api/routes/:id
 * @desc    Lấy chi tiết 1 tuyến đường
 * @access  Private (Admin, Provider)
 */
router.get('/:id', providerAccess, routeController.getRouteById);

/**
 * @route   POST /api/routes
 * @desc    Tạo 1 tuyến đường mới (Admin tạo tuyến hệ thống, Provider tạo tuyến riêng)
 * @access  Private (Admin, Provider)
 */
router.post(
    '/',
    providerAccess,
    validateRouteCreation,
    handleValidationErrors,
    routeController.createRoute
);

/**
 * @route   PATCH /api/routes/:id
 * @desc    Cập nhật 1 tuyến đường (Provider chỉ được cập nhật tuyến của mình)
 * @access  Private (Admin, Provider)
 */
router.patch(
    '/:id',
    providerAccess,
    checkRouteOwnership,
    validateRouteUpdate,
    handleValidationErrors,
    routeController.updateRoute
);
/**
 * @route   DELETE /api/routes/:id
 * @desc    Xóa 1 tuyến đường (Provider chỉ được xóa tuyến của mình)
 * @access  Private (Admin, Provider)
 */
router.delete(
    '/:id',
    providerAccess,
    checkRouteOwnership,
    routeController.deleteRoute
);
module.exports = router;