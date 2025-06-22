const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { loggedin, ensureRole } = require('../middlewares/identification');
const { isProvider } = require('../middlewares/roleMiddleware');
const { handleValidationErrors } = require('../middlewares/validationHandler');

const {
    validateSearchTrip,
    validateGetAllTrips,
    validateCreateTrip,
    validateUpdateTrip,
    validateIdInParams
} = require('../validators/tripValidator');



// === CÁC ROUTE CÔNG KHAI (KHÔNG CẦN ĐĂNG NHẬP) ===

router.get(
    '/featured',
     tripController.getFeaturedTrips
);


router.get(
    '/search', 
    validateSearchTrip,       // 1. Áp dụng quy tắc
    handleValidationErrors,   // 2. Xử lý lỗi nếu có
    tripController.searchTripsByCity // 3. Chạy controller
);

router.get(
    '/:tripId/tickets', 
    validateIdInParams,
    handleValidationErrors,
    tripController.getTicketsForTrip
);



// === CÁC ROUTE CẦN XÁC THỰC VÀ PHÂN QUYỀN ===
// Get all trips (admin, provider)
router.get(
    '/', 
    loggedin, 
    ensureRole(['admin', 'provider']), 
    isProvider,
    validateGetAllTrips,      // Áp dụng quy tắc phân trang
    handleValidationErrors,
    tripController.getAllTrips
);

// Get trip by ID
router.get(
    '/:tripId', 
    loggedin, 
    ensureRole(['admin', 'provider']), 
    isProvider,
    validateIdInParams,       // Áp dụng quy tắc kiểm tra ID
    handleValidationErrors,
    tripController.getTripById
);

// Create trip
router.post(
    '/', 
    loggedin, 
    ensureRole(['admin', 'provider']), 
    isProvider,
    validateCreateTrip,       // Áp dụng quy tắc tạo trip
    handleValidationErrors,
    tripController.createTrip
);

// Update trip
router.patch(
    '/tripId', 
    loggedin, 
    ensureRole(['admin', 'provider']), 
    isProvider,
    validateUpdateTrip,       // Áp dụng quy tắc cập nhật trip
    handleValidationErrors,
    tripController.updateTrip
);

// Delete trip
router.delete(
    '/:tripId', 
    loggedin, 
    ensureRole(['admin', 'provider']), 
    isProvider,
    validateIdInParams,       // Áp dụng quy tắc kiểm tra ID
    handleValidationErrors,
    tripController.deleteTrip
);

module.exports = router;
