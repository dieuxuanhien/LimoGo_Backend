// src/validators/tripValidator.js
const { query, body, param } = require('express-validator');

// === VALIDATOR CHO TÌM KIẾM (PUBLIC) ===
exports.validateSearchTrip = [
    query('originCity').notEmpty().withMessage('Điểm đi không được để trống.'),
    query('destinationCity').notEmpty().withMessage('Điểm đến không được để trống.'),
    query('departureDate')
        .notEmpty().withMessage('Ngày khởi hành không được để trống.')
        .isISO8601().withMessage('Ngày khởi hành phải có định dạng YYYY-MM-DD.')
        .custom((value) => {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            if (new Date(value) < today) {
                throw new Error('Ngày khởi hành không được là một ngày trong quá khứ.');
            }
            return true;
        })
];

// === VALIDATOR CHO LẤY DANH SÁCH (CÓ PHÂN TRANG) ===
exports.validateGetAllTrips = [
    query('page')
        .optional() // "page" là tùy chọn
        .isInt({ gt: 0 }).withMessage('Page phải là số nguyên lớn hơn 0.')
        .toInt(), // Chuyển đổi thành số
    query('limit')
        .optional() // "limit" là tùy chọn
        .isInt({ gt: 0, lte: 100 }).withMessage('Limit phải là số nguyên từ 1 đến 100.') // Giới hạn limit tối đa là 100
        .toInt() // Chuyển đổi thành số
];

// === VALIDATOR CHO VIỆC TẠO MỚI TRIP ===
exports.validateCreateTrip = [
    body('route').notEmpty().withMessage('Route là bắt buộc.').isMongoId().withMessage('Route ID không hợp lệ.'),
    body('vehicle').notEmpty().withMessage('Vehicle là bắt buộc.').isMongoId().withMessage('Vehicle ID không hợp lệ.'),
    body('driver').notEmpty().withMessage('Driver là bắt buộc.').isMongoId().withMessage('Driver ID không hợp lệ.'),
    body('departureTime').notEmpty().withMessage('Thời gian đi là bắt buộc.').isISO8601().toDate().withMessage('Định dạng thời gian đi không hợp lệ.'),
    body('arrivalTime')
        .notEmpty().withMessage('Thời gian đến là bắt buộc.')
        .isISO8601().toDate().withMessage('Định dạng thời gian đến không hợp lệ.')
        .custom((value, { req }) => {
            if (value <= req.body.departureTime) {
                throw new Error('Thời gian đến phải sau thời gian đi.');
            }
            return true;
        }),
    body('price').notEmpty().withMessage('Giá vé là bắt buộc.').isFloat({ gt: 0 }).withMessage('Giá vé phải là một số lớn hơn 0.')
];

// === VALIDATOR CHO VIỆC CẬP NHẬT TRIP ===
exports.validateUpdateTrip = [
    param('id').isMongoId().withMessage('ID chuyến đi không hợp lệ.'),
    // Các trường trong body đều là tùy chọn, nhưng nếu có thì phải hợp lệ
    body('route').optional().isMongoId().withMessage('Route ID không hợp lệ.'),
    body('vehicle').optional().isMongoId().withMessage('Vehicle ID không hợp lệ.'),
    body('driver').optional().isMongoId().withMessage('Driver ID không hợp lệ.'),
    body('departureTime').optional().isISO8601().toDate().withMessage('Định dạng thời gian đi không hợp lệ.'),
    body('arrivalTime').optional().isISO8601().toDate().withMessage('Định dạng thời gian đến không hợp lệ.'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Giá vé phải là một số lớn hơn 0.'),
    body('status').optional().isIn(['scheduled', 'in-progress', 'completed', 'cancelled']).withMessage('Trạng thái không hợp lệ.')
];

// === VALIDATOR CHUNG CHO VIỆC KIỂM TRA ID TRONG PARAMS ===
exports.validateIdInParams = [
    param('id').isMongoId().withMessage('ID không hợp lệ.')
];