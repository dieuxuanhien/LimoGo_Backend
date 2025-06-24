const express = require('express');
const router = express.Router();

// --- Các import cần thiết ---
const imageUploader = require('../middlewares/imageUpload');
const { loggedin, ensureRole } = require('../middlewares/identification');
const { isProvider } = require('../middlewares/roleMiddleware');
const { handleValidationErrors } = require('../middlewares/validationHandler');
const { validateDriverCreation, validateDriverUpdate } = require('../validators/driverValidator');
const driverController = require('../controllers/driverController');
const { checkDriverOwnership } = require('../middlewares/ownershipMiddleware'); // <<< IMPORT MỚI

// Middleware chung cho các route cần vai trò 'provider'
const providerAccess = [loggedin, ensureRole(['admin', 'provider']), isProvider];

/*
 * @route   GET /api/drivers
 * @desc    Lấy tất cả tài xế
 * @access  Private (Admin, Provider)
 */
router.get('/', providerAccess, driverController.getAllDrivers);

/*
 * @route   POST /api/drivers
 * @desc    Tạo tài xế mới
 * @access  Private (Admin, Provider)
 */
router.post(
    '/',
    providerAccess,
    imageUploader.uploadImage('photo'),
    validateDriverCreation,
    handleValidationErrors,
    driverController.createDriver
);

/*
 * @route   GET /api/drivers/:id
 * @desc    Lấy chi tiết một tài xế
 * @access  Private (Admin, Provider)
 */
// >>> THÊM `checkDriverOwnership`
router.get('/:id', providerAccess, checkDriverOwnership, driverController.getDriverById);

/*
 * @route   PATCH /api/drivers/:id
 * @desc    Cập nhật thông tin tài xế
 * @access  Private (Admin, Provider)
 */
router.patch(
    '/:id',
    providerAccess,
    checkDriverOwnership, // <<< THÊM `checkDriverOwnership`
    imageUploader.uploadImage('photo'),          // Chạy sau khi xác thực quyền để tránh xử lý ảnh không cần thiết
    validateDriverUpdate,
    handleValidationErrors,
    driverController.updateDriver
);

/*
 * @route   DELETE /api/drivers/:id
 * @desc    Xóa một tài xế
 * @access  Private (Admin, Provider)
 */
// >>> THÊM `checkDriverOwnership`
router.delete('/:id', providerAccess, checkDriverOwnership, driverController.deleteDriver);

module.exports = router;