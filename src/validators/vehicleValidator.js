const { body } = require('express-validator');
const Vehicle = require('../models/vehicle');

/**
 * @desc Validator để TẠO MỚI xe (yêu cầu tất cả các trường bắt buộc)
 */
exports.validateVehicleCreation = [
  body('type')
    .trim()
    .notEmpty().withMessage('Loại xe không được để trống.'),

  body('currentStation')
    .notEmpty().withMessage('Bến đỗ hiện tại không được để trống.')
    .isMongoId().withMessage('ID bến đỗ không hợp lệ.'),

  body('licensePlate')
    .trim()
    .notEmpty().withMessage('Biển số xe không được để trống.')
    .isLength({ min: 6 }).withMessage('Biển số xe phải có ít nhất 6 ký tự.')
    .custom(async (value) => {
      const existingVehicle = await Vehicle.findOne({ licensePlate: value.toUpperCase() });
      if (existingVehicle) {
        throw new Error('Biển số xe này đã tồn tại trong hệ thống.');
      }
      return true;
    }),

  body('capacity')
    .notEmpty().withMessage('Sức chứa không được để trống.')
    .isInt({ min: 1 }).withMessage('Sức chứa phải là một số nguyên lớn hơn 0.'),
  
  // Các trường không bắt buộc
  body('status')
    .optional()
    .isIn(['available', 'in-use', 'maintenance']).withMessage('Trạng thái xe không hợp lệ.'),

  body('manufacturer').optional().trim(),
  body('model').optional().trim()
];


/**
 * @desc Validator để CẬP NHẬT xe (chỉ validate các trường được gửi lên)
 */
exports.validateVehicleUpdate = [
    // Thêm .optional() vào các trường để không bắt buộc phải gửi lên khi cập nhật
    body('type')
      .optional()
      .trim()
      .notEmpty().withMessage('Loại xe không được để trống.'),
  
    body('currentStation')
      .optional()
      .isMongoId().withMessage('ID bến đỗ không hợp lệ.'),
  
    body('licensePlate')
      .optional()
      .trim()
      .isLength({ min: 6 }).withMessage('Biển số xe phải có ít nhất 6 ký tự.')
      .custom(async (value, { req }) => {
        const vehicle = await Vehicle.findOne({ licensePlate: value.toUpperCase() });
        // Nếu tìm thấy xe và ID của xe đó khác với ID xe đang cập nhật -> báo lỗi
        if (vehicle && String(vehicle._id) !== req.params.id) {
          throw new Error('Biển số xe này đã tồn tại trong hệ thống.');
        }
        return true;
      }),
  
    body('capacity')
      .optional()
      .isInt({ min: 1 }).withMessage('Sức chứa phải là một số nguyên lớn hơn 0.'),
  
    body('status')
      .optional()
      .isIn(['available', 'in-use', 'maintenance']).withMessage('Trạng thái xe không hợp lệ.'),
  
    body('manufacturer').optional().trim(),
    body('model').optional().trim(),
    body('image').optional().trim()
];
