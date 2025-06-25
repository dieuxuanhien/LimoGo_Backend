const { body, param } = require('express-validator');
const User = require('../models/user');


// === VALIDATOR MỚI ĐỂ KIỂM TRA ID TRÊN PARAMS ===
exports.validateUserIdInParams = [
    param('id')
        .isMongoId().withMessage('ID người dùng không hợp lệ.')
        .custom(async (id, { req }) => {
            const user = await User.findById(id);
            if (!user) {
                return Promise.reject('Không tìm thấy người dùng với ID này.');
            }
            // Gắn user tìm được vào request để controller có thể tái sử dụng
            req.foundUser = user; 
            return true;
        })
];

// === VALIDATION CHO ADMIN TẠO USER ===
exports.validateCreateUser = [
    body('email')
        .notEmpty().withMessage('Email là bắt buộc')
        .isEmail().withMessage('Email phải có định dạng hợp lệ')
        .normalizeEmail()
        .custom(async (value) => {
            // Kiểm tra email đã tồn tại trong DB chưa
            const user = await User.findOne({ email: value });
            if (user) {
                return Promise.reject('Email này đã được sử dụng');
            }
        }),

    body('password')
        .notEmpty().withMessage('Mật khẩu là bắt buộc')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

    body('phoneNumber')
        .notEmpty().withMessage('Số điện thoại là bắt buộc')
        .matches(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/).withMessage('Số điện thoại không hợp lệ')
        .custom(async (value) => {
            // Kiểm tra SĐT đã tồn tại trong DB chưa
            const user = await User.findOne({ phoneNumber: value });
            if (user) {
                return Promise.reject('Số điện thoại này đã được sử dụng');
            }
        }),

    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Tên không được để trống'),

    body('gender')
        .optional()
        .isIn(['Male', 'Female', 'Others']).withMessage("Giới tính không hợp lệ"),

    body('dateOfBirth')
        .optional()
        .isISO8601().withMessage('Ngày sinh phải có định dạng YYYY-MM-DD')
        .toDate(), // Chuyển đổi thành đối tượng Date

    body('userRole')
        .optional()
        .isIn(['admin', 'customer', 'provider']).withMessage("Vai trò người dùng không hợp lệ"),

    body('verified')
        .optional()
        .isBoolean().withMessage('Trạng thái xác thực phải là true hoặc false'),
];


// === VALIDATION CHO ADMIN CẬP NHẬT USER ===
// Tương tự như create, nhưng mọi thứ đều là optional
// và logic kiểm tra trùng lặp phức tạp hơn một chút
exports.validateUpdateUser = [
    body('email')
        .optional()
        .isEmail().withMessage('Email phải có định dạng hợp lệ')
        .normalizeEmail()
        .custom(async (value, { req }) => {
            // Kiểm tra email mới có bị trùng với người dùng nào khác không
            const user = await User.findOne({ email: value, _id: { $ne: req.params.id } });
            if (user) {
                return Promise.reject('Email này đã được người dùng khác sử dụng');
            }
        }),

    body('password')
        .optional()
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

    body('phoneNumber')
        .optional()
        .matches(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/).withMessage('Số điện thoại không hợp lệ')
        .custom(async (value, { req }) => {
            // Kiểm tra SĐT mới có bị trùng với người dùng nào khác không
            const user = await User.findOne({ phoneNumber: value, _id: { $ne: req.params.id } });
            if (user) {
                return Promise.reject('Số điện thoại này đã được người dùng khác sử dụng');
            }
        }),

    // Các trường còn lại tương tự như createUser nhưng là optional
    body('name').optional().trim().notEmpty().withMessage('Tên không được để trống'),
    body('gender').optional().isIn(['Male', 'Female', 'Others']).withMessage("Giới tính không hợp lệ"),
    body('dateOfBirth').optional().isISO8601().withMessage('Ngày sinh phải có định dạng YYYY-MM-DD').toDate(),
    body('userRole').optional().isIn(['admin', 'customer', 'provider']).withMessage("Vai trò người dùng không hợp lệ"),
    body('verified').optional().isBoolean().withMessage('Trạng thái xác thực phải là true hoặc false'),
];


// === VALIDATION CHO USER TỰ CẬP NHẬT THÔNG TIN (/updateMe) ===
exports.validateUpdateMe = [
    body('name').optional().trim().notEmpty().withMessage('Tên không được để trống'),
    body('gender').optional().isIn(['Male', 'Female', 'Khác']).withMessage("Giới tính không hợp lệ"),
    body('dateOfBirth').optional().isISO8601().withMessage('Ngày sinh phải có định dạng YYYY-MM-DD').toDate(),
    
    // Kiểm tra để người dùng không tự ý thay đổi các trường nhạy cảm
    body('email').not().exists().withMessage('Không được phép thay đổi email.'),
    body('password').not().exists().withMessage('Không được phép thay đổi mật khẩu qua API này.'),
    body('userRole').not().exists().withMessage('Không được phép thay đổi vai trò.'),
    body('verified').not().exists().withMessage('Không được phép thay đổi trạng thái xác thực.'),
];

exports.validateUpdateMyPassword = [
    body('passwordCurrent')
        .notEmpty().withMessage('Mật khẩu hiện tại là bắt buộc'),
    
    body('password')
        .notEmpty().withMessage('Mật khẩu mới là bắt buộc')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),

    body('passwordConfirm')
        .notEmpty().withMessage('Bạn cần xác nhận mật khẩu mới')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Mật khẩu xác nhận không khớp với mật khẩu mới');
            }
            return true;
        }),
];