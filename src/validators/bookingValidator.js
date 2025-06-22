const { body } = require('express-validator');

// Quy tắc cho việc khóa ghế
exports.validateLockSeat = [
    body('ticketId')
        .notEmpty().withMessage('ticketId là bắt buộc.')
        .isMongoId().withMessage('ticketId không hợp lệ.')
];

// Quy tắc cho việc xác nhận đặt vé
exports.validateConfirmBooking = [
    body('ticketIds')
        .notEmpty().withMessage('ticketIds là bắt buộc.')
        .isArray({ min: 1 }).withMessage('ticketIds phải là một mảng chứa ít nhất 1 vé.'),
    
    // Dấu '*' là một wildcard, kiểm tra cho mỗi phần tử bên trong mảng ticketIds
    body('ticketIds.*')
        .isMongoId().withMessage('Mỗi ticketId trong mảng phải là một ID hợp lệ.')
];