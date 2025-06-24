const { query } = require('express-validator');

exports.validateGetDashboardStats = [
    query('period')
        .optional() // Cho phép không cần có trường này
        .isIn(['today', 'week', 'month', 'year'])
        .withMessage('Giá trị của period không hợp lệ. Chỉ chấp nhận: today, week, month, year.')
];