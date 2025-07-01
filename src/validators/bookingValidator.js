const { body, param, query } = require('express-validator');

// Quy tắc cho việc khóa ghế
exports.validateLockSeat = [
    body('ticketId')
        .notEmpty().withMessage('ticketId là bắt buộc.')
        .isMongoId().withMessage('ticketId không hợp lệ.')
];

// Quy tắc cho việc khóa nhiều ghế
exports.validateLockMultipleSeats = [
    body('ticketIds')
        .notEmpty().withMessage('ticketIds là bắt buộc.')
        .isArray({ min: 1 }).withMessage('ticketIds phải là một mảng chứa ít nhất 1 vé.'),
    
    body('ticketIds.*')
        .isMongoId().withMessage('Mỗi ticketId trong mảng phải là một ID hợp lệ.')
];

// Quy tắc cho việc xác nhận đặt vé
exports.validateConfirmBooking = [
    body('ticketIds')
        .notEmpty().withMessage('ticketIds là bắt buộc.')
        .isArray({ min: 1 }).withMessage('ticketIds phải là một mảng chứa ít nhất 1 vé.'),
    
    body('ticketIds.*')
        .isMongoId().withMessage('Mỗi ticketId trong mảng phải là một ID hợp lệ.'),

    // THÊM QUY TẮC MỚI
    body('paymentMethod')
        .notEmpty().withMessage('Phương thức thanh toán là bắt buộc.')
        .isIn(['cash', 'bank_transfer']).withMessage('Phương thức thanh toán không hợp lệ.')
];


// Quy tắc cho API duyệt đơn hàng
exports.validateApproveBooking = [
    param('bookingId')
        .isMongoId().withMessage('Booking ID trong URL không hợp lệ.')
];


exports.validateGetHistory = [
    query('page')
        .optional() // "page" là tùy chọn, không bắt buộc
        .isInt({ gt: 0 }).withMessage('Page phải là số nguyên lớn hơn 0.')
        .toInt(), // Tiện ích: tự động chuyển đổi chuỗi thành số

    query('limit')
        .optional() // "limit" là tùy chọn
        .isInt({ gt: 0, lte: 50 }).withMessage('Limit phải là số nguyên từ 1 đến 50.') // Giới hạn để tránh client yêu cầu quá nhiều dữ liệu
        .toInt()
];

exports.validateUnlockTickets = [
    body('ticketIds')
        .notEmpty().withMessage('Mảng ticketIds là bắt buộc.')
        .isArray({ min: 1 }).withMessage('ticketIds phải là một mảng chứa ít nhất 1 vé.'),
    
    // Dùng ký tự đại diện (*) để kiểm tra từng phần tử trong mảng
    body('ticketIds.*')
        .isMongoId().withMessage('Mỗi ticketId trong mảng phải là một ID Mongo hợp lệ.')
];