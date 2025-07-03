const { body } = require('express-validator');

exports.validateStationCreation = [
    body('name').trim().notEmpty().withMessage('Tên điểm đón/trả là bắt buộc.'),
    body('city').trim().notEmpty().withMessage('Tên thành phố là bắt buộc.'),
    body('address').trim().notEmpty().withMessage('Địa chỉ chi tiết là bắt buộc.'),
    // THÊM MỚI: isPrivate là một boolean tùy chọn
    body('isPrivate').optional().isBoolean().withMessage('isPrivate phải là true hoặc false.')
];

exports.validateStationUpdate = [
    body('name').optional().trim().notEmpty().withMessage('Tên không được để trống.'),
    body('address').optional().trim().notEmpty().withMessage('Địa chỉ không được để trống.'),
    body('city').optional().trim().notEmpty().withMessage('Thành phố không được để trống.'),

    // Ngăn người dùng thay đổi các trường quan trọng
    body('type').not().exists().withMessage('Không được phép thay đổi loại trạm.'),
    body('ownerProvider').not().exists().withMessage('Không được phép thay đổi chủ sở hữu.')
];