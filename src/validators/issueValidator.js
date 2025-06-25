// src/validators/issueValidator.js
const { body, param, query } = require('express-validator');

// Quy tắc khi tạo một sự cố mới
exports.validateCreateIssue = [
    body('title')
        .trim()
        .notEmpty().withMessage('Tiêu đề không được để trống.'),
    body('description')
        .trim()
        .notEmpty().withMessage('Mô tả không được để trống.'),
    body('category')
        .optional()
        .isIn(['technical', 'payment', 'service_quality', 'other'])
        .withMessage('Phân loại sự cố không hợp lệ.'),
    body('trip')
        .optional()
        .isMongoId().withMessage('Trip ID không hợp lệ.'),
    body('booking')
        .optional()
        .isMongoId().withMessage('Booking ID không hợp lệ.')
];

// Quy tắc khi admin lấy danh sách sự cố (validate các query filter)
exports.validateGetAllIssues = [
    query('page').optional().isInt({ gt: 0 }).withMessage('Page phải là số nguyên lớn hơn 0.').toInt(),
    query('limit').optional().isInt({ gt: 0, lte: 100 }).withMessage('Limit phải là số nguyên từ 1 đến 100.').toInt(),
    query('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']).withMessage('Trạng thái không hợp lệ.'),
    query('category').optional().isIn(['technical', 'payment', 'service_quality', 'other']).withMessage('Phân loại không hợp lệ.'),
    query('user').optional().isMongoId().withMessage('User ID không hợp lệ.')
];

// Quy tắc khi cập nhật một sự cố
exports.validateUpdateIssue = [
    param('id').isMongoId().withMessage('Issue ID trong URL không hợp lệ.'),
    // Các trường trong body là tùy chọn, nhưng nếu có thì phải hợp lệ
    body('title').optional().trim().notEmpty().withMessage('Tiêu đề không được để trống.'),
    body('description').optional().trim().notEmpty().withMessage('Mô tả không được để trống.'),
    body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']).withMessage('Trạng thái không hợp lệ.'),
    body('category').optional().isIn(['technical', 'payment', 'service_quality', 'other']).withMessage('Phân loại không hợp lệ.')
];

// Quy tắc chung để kiểm tra ID trong params
exports.validateIdInParams = [
    param('id').isMongoId().withMessage('ID trong URL không hợp lệ.')
];