// file: routes/providerRouter.js

const express = require('express');
const router = express.Router();

const providerController = require('../controllers/providerController');
const { loggedin, ensureRole } = require('../middlewares/identification');
const { isProvider } = require('../middlewares/roleMiddleware');
const { handleValidationErrors } = require('../middlewares/validationHandler');

// 1. Import các validator mới
const { 
    validateGetDashboardStats, 
    validateProviderCreation, 
    validateProviderUpdate,
    validateProviderProfileUpdate 
} = require('../validators/providerValidator');



// Routes cho Provider tự thao tác
router.get(
    '/dashboard-stats',
    loggedin,
    ensureRole(['provider']),
    isProvider,
    validateGetDashboardStats,
    handleValidationErrors,
    providerController.getDashboardStats
);

router.get('/me', loggedin, ensureRole(['provider']), providerController.getProviderByCurrentUser);

router.patch(
    '/me', 
    loggedin, 
    ensureRole(['provider']),
    validateProviderProfileUpdate,
    handleValidationErrors,
    providerController.updateProviderByCurrentUser
);

// Routes cho Admin quản lý
router.get('/user/:mainUser', loggedin, ensureRole(['admin']), providerController.getProviderByMainUser);

router.get('/', loggedin, ensureRole(['admin']), providerController.getAllProviders);
router.get('/:id', loggedin, ensureRole(['admin']), providerController.getProviderById);

// 2. Áp dụng validator cho route TẠO MỚI
router.post(
    '/', 
    loggedin, 
    ensureRole(['admin']),
    validateProviderCreation,
    handleValidationErrors,
    providerController.createProvider
);

// 3. Áp dụng validator cho route CẬP NHẬT
router.patch(
    '/:id', 
    loggedin, 
    ensureRole(['admin']),
    validateProviderUpdate,
    handleValidationErrors,
    providerController.updateProvider
);

router.delete('/:id', loggedin, ensureRole(['admin']), providerController.deleteProvider);

module.exports = router;