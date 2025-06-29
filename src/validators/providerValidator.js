// file: validators/providerValidator.js

const { body, query } = require('express-validator');
const Provider = require('../models/provider'); // Đảm bảo đường dẫn đúng

exports.validateProviderCreation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Tên nhà xe là bắt buộc.'),

    body('email')
        .isEmail().withMessage('Email không hợp lệ.')
        .normalizeEmail()
        .custom(async (value) => {
            const provider = await Provider.findOne({ email: value });
            if (provider) {
                return Promise.reject('Email này đã được sử dụng.');
            }
        }),

    body('phone')
            .optional()
            .matches(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/).withMessage('Số điện thoại không hợp lệ')
            .custom(async (value, { req }) => {
                // Kiểm tra SĐT mới có bị trùng với người dùng nào khác không
                const provider = await Provider.findOne({ phoneNumber: value, _id: { $ne: req.params.id } });
                if (provider) {
                    return Promise.reject('Số điện thoại này đã được người dùng khác sử dụng');
                }
            }),

    body('address')
        .trim()
        .notEmpty().withMessage('Địa chỉ là bắt buộc.'),

    body('mainUser')
        .optional()
        .isMongoId().withMessage('ID người dùng không hợp lệ.')
];

exports.validateProviderUpdate = [
    // Khi cập nhật, các trường đều là optional, nhưng nếu có thì phải hợp lệ.
    body('name')
        .optional().trim().notEmpty().withMessage('Tên nhà xe không được để trống.'),

    body('email')
        .optional()
        .isEmail().withMessage('Email không hợp lệ.')
        .normalizeEmail()
        .custom(async (value, { req }) => {
            // Kiểm tra email mới có bị trùng với nhà xe khác không
            const provider = await Provider.findOne({ email: value, _id: { $ne: req.params.id } });
            if (provider) {
                return Promise.reject('Email này đã được sử dụng.');
            }
        }),

    body('phone')
        .optional()
        .notEmpty().withMessage('Số điện thoại là bắt buộc')
        .matches(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/).withMessage('Số điện thoại không hợp lệ')
        .custom(async (value) => {
            // Kiểm tra SĐT đã tồn tại trong DB chưa
            const provider = await Provider.findOne({ phoneNumber: value });
            if (provider) {
                return Promise.reject('Số điện thoại này đã được sử dụng');
            }
        }),

    body('address')
        .optional().trim().notEmpty().withMessage('Địa chỉ không được để trống.'),

    body('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Trạng thái không hợp lệ. Chỉ chấp nhận: active, inactive.'),

    body('mainUser')
        .not().exists()
        .withMessage('Không thể thay đổi người dùng chính qua endpoint này. Vui lòng sử dụng một chức năng khác.')
];


exports.validateProviderProfileUpdate = [
    // Các trường được phép cập nhật
    body('name').optional().trim().notEmpty().withMessage('Tên nhà xe không được để trống.'),

    body('phone')
        .optional()
        .matches(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/).withMessage('Số điện thoại không hợp lệ')
        .custom(async (value, { req }) => {
            // Kiểm tra SĐT mới có bị trùng với người dùng nào khác không
            const provider = await Provider.findOne({ phoneNumber: value, _id: { $ne: req.params.id } });
            if (provider) {
                return Promise.reject('Số điện thoại này đã được người dùng khác sử dụng');
            }
        }),

    body('address').optional().trim().notEmpty().withMessage('Địa chỉ không được để trống.'),
    body('taxId').optional().trim(),

    // Các trường BỊ CẤM cập nhật
    body('email')
        .not().exists()
        .withMessage('Không được phép thay đổi email. Vui lòng liên hệ quản trị viên.'),
    body('status')
        .not().exists()
        .withMessage('Không được phép thay đổi trạng thái. Vui lòng liên hệ quản trị viên.'),
    body('mainUser')
        .not().exists()
        .withMessage('Không được phép thay đổi người dùng chính.')
];


// Giữ nguyên validator cho dashboard
exports.validateGetDashboardStats = [
    query('period')
        .optional()
        .isIn(['today', 'week', 'month', 'year'])
        .withMessage('Giá trị của period không hợp lệ. Chỉ chấp nhận: today, week, month, year.')
];