const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { loggedin, ensureRole } = require('../middlewares/identification');

// Import các validator
const { validateCreateReview, validateUpdateReview, validateReviewIdInParams } = require('../validators/reviewValidator');
const { handleValidationErrors } = require('../middlewares/validationHandler');

// Kiểm tra xem người dùng có thể review chuyến đi hay không.
router.get(
    '/can-review/:tripId',
    loggedin,
    reviewController.canReviewTrip
);

// Tạo một review mới
router.post(
    '/',
    loggedin, ensureRole(['customer']),
    validateCreateReview, 
    handleValidationErrors,
    reviewController.createReview
);

// Lấy tất cả review (chỉ dành cho Admin)
router.get(
    '/',
    loggedin, ensureRole(['admin']),
    reviewController.getAllReviews
);

// Cập nhật review của chính mình
router.patch(
    '/:reviewId',
    loggedin, ensureRole(['customer']),
    validateUpdateReview, // Cần tạo validator này
    handleValidationErrors,
    reviewController.updateReview
);

// Xóa một review (chủ sở hữu hoặc admin)
router.delete(
    '/:reviewId',
    loggedin,
    validateReviewIdInParams,
    handleValidationErrors,
    reviewController.deleteReview
);

module.exports = router;