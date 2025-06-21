const { query, validationResult } = require('express-validator');

// Mảng chứa các quy tắc validation cho API tìm kiếm
const validatorSearchTrip = [
    query('originCity')
        .notEmpty()
        .withMessage('Điểm đi không được để trống.')
        .isString()
        .withMessage('Điểm đi phải là một chuỗi.'),

    query('destinationCity')
        .notEmpty()
        .withMessage('Điểm đến không được để trống.')
        .isString()
        .withMessage('Điểm đến phải là một chuỗi.'),
    
    query('departureDate')
        .notEmpty()
        .withMessage('Ngày khởi hành không được để trống.')
        .isISO8601()    // Kiểm tra định dạng YYYY-MM-DD
        .withMessage('Ngày khởi hành phải là một định dạng ngày hợp lệ (YYYY-MM-DD).')
        .custom( value => {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            if (new Date(value) < today) {
                throw new Error('Ngày khởi hành không được là một ngày trong quá khứ.');
            }
            return true;
        })
];


// Middleware để xử lý lỗi validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
}

// Export các validator và middleware
module.exports = {
    validatorSearchTrip,
    handleValidationErrors
};