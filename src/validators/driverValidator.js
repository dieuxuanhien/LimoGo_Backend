const { body } = require('express-validator');
const Provider = require('../models/provider'); // Để kiểm tra sự tồn tại của provider
const Station = require('../models/station'); // Để kiểm tra sự tồn tại của station

const validateDriverCreation = [
    // 1. name: Phải là chuỗi, không rỗng, tối thiểu 2 ký tự
    body('name')
        .trim()
        .notEmpty().withMessage('Tên tài xế là bắt buộc.')
        .isString().withMessage('Tên tài xế phải là chuỗi.')
        .isLength({ min: 2 }).withMessage('Tên tài xế phải có ít nhất 2 ký tự.'),

    // 2. age: Phải là số nguyên, trong độ tuổi lao động (ví dụ: 18-60)
    body('age')
        .notEmpty().withMessage('Tuổi là bắt buộc.')
        .isInt({ min: 18, max: 60 }).withMessage('Tuổi phải từ 18 đến 60.'),

    // 3. currentStation: Phải là một MongoID hợp lệ và tồn tại trong DB
    body('currentStation')
        .notEmpty().withMessage('Bến đỗ hiện tại là bắt buộc.')
        .isMongoId().withMessage('ID bến đỗ không hợp lệ.')
        .custom(async (value) => {
            const station = await Station.findById(value);
            if (!station) {
                return Promise.reject('Bến đỗ không tồn tại trong hệ thống.');
            }
        }),

    // 4. provider: Trường này chỉ bắt buộc khi admin tạo, provider tự động gán
    body('provider')
        .if((value, { req }) => req.user.role === 'admin') // Chỉ validate khi người dùng là admin
        .notEmpty().withMessage('Admin phải cung cấp ID nhà xe.')
        .isMongoId().withMessage('ID nhà xe không hợp lệ.')
        .custom(async (value) => {
            const provider = await Provider.findById(value);
            if (!provider) {
                return Promise.reject('Nhà xe không tồn tại trong hệ thống.');
            }
        }),
    
    // 5. status: Tùy chọn, nhưng nếu có phải là 'available' hoặc 'assigned'
    body('status')
        .optional()
        .isIn(['available', 'assigned']).withMessage("Trạng thái không hợp lệ, chỉ chấp nhận 'available' hoặc 'assigned'.")
];

const validateDriverUpdate = [
     // Các quy tắc tương tự như create, nhưng đều là optional() vì đây là update (PATCH)
     // Người dùng có thể chỉ cập nhật 1 trường duy nhất.
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Tên tài xế không được để trống.')
        .isString().withMessage('Tên tài xế phải là chuỗi.')
        .isLength({ min: 2 }).withMessage('Tên tài xế phải có ít nhất 2 ký tự.'),

    body('age')
        .optional()
        .isInt({ min: 18, max: 60 }).withMessage('Tuổi phải từ 18 đến 60.'),

    body('currentStation')
        .optional()
        .isMongoId().withMessage('ID bến đỗ không hợp lệ.')
        .custom(async (value) => {
            const station = await Station.findById(value);
            if (!station) {
                return Promise.reject('Bến đỗ không tồn tại trong hệ thống.');
            }
        }),
    
    body('status')
        .optional()
        .isIn(['available', 'assigned']).withMessage("Trạng thái không hợp lệ, chỉ chấp nhận 'available' hoặc 'assigned'.")
];


module.exports = {
    validateDriverCreation,
    validateDriverUpdate
};