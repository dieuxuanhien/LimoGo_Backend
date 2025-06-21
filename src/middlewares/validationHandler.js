const { validationResult } = require('express-validator');

exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Dữ liệu đầu vào không hợp lệ.", // Có thể giữ một message chung
            // Hoặc dùng .mapped() để nhóm lỗi theo từng trường
            errors: errors.mapped() 
        });
    }
    next();
};