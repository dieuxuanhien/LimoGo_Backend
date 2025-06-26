const { body } = require('express-validator');

exports.validateStationCreation = [
    body('name').trim().notEmpty().withMessage('Tên trạm/bến xe là bắt buộc.'),
    body('city').trim().notEmpty().withMessage('Tên thành phố là bắt buộc.'),
    body('address').trim().notEmpty().withMessage('Địa chỉ chi tiết là bắt buộc.'),

    // Kiểm tra 'type' dựa trên vai trò người dùng
    body('type')
        .isIn(['main_station', 'pickup_point']).withMessage("Loại trạm không hợp lệ, chỉ chấp nhận 'main_station' hoặc 'pickup_point'.")
        .custom((value, { req }) => {
            // Nếu là Provider, họ chỉ được phép tạo 'pickup_point'
            if (req.user.role === 'provider' && value !== 'pickup_point') {
                throw new Error('Nhà xe chỉ có thể tạo các "điểm đón/trả riêng" (pickup_point).');
            }
            return true;
        })
];

exports.validateStationUpdate = [
    // Khi cập nhật, các trường đều là tùy chọn
    body('name').optional().trim().notEmpty().withMessage('Tên trạm/bến xe là bắt buộc.'),
    body('city').optional().trim().notEmpty().withMessage('Tên thành phố là bắt buộc.'),
    body('address').optional().trim().notEmpty().withMessage('Địa chỉ chi tiết là bắt buộc.'),

    // Provider không được phép thay đổi loại station hoặc chủ sở hữu
    body('type').not().exists().withMessage('Không được phép thay đổi loại trạm.'),
    body('ownerProvider').not().exists().withMessage('Không được phép thay đổi chủ sở hữu.')
];