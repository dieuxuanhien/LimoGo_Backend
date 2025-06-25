// src/validators/reviewValidator.js
const { body, param } = require('express-validator');

exports.validateCreateReview = [
    body('tripId').notEmpty().withMessage('Trip ID là bắt buộc.').isMongoId().withMessage('Trip ID không hợp lệ.'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Điểm đánh giá phải là số nguyên từ 1 đến 5.'),
    body('comment').optional().isString().trim().isLength({ max: 500 }).withMessage('Bình luận không được quá 500 ký tự.')
];

exports.validateUpdateReview = [
    param('reviewId').isMongoId().withMessage('Review ID không hợp lệ.'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Điểm đánh giá phải là số nguyên từ 1 đến 5.'),
    body('comment').optional().isString().trim().isLength({ max: 500 }).withMessage('Bình luận không được quá 500 ký tự.')
];

exports.validateReviewIdInParams = [
    param('reviewId').isMongoId().withMessage('Review ID không hợp lệ.')
];