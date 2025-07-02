const { body } = require('express-validator');
const Station = require('../models/station');

exports.validateRouteCreation = [
    body('originStation')
        .notEmpty().withMessage('Bến đi là bắt buộc.')
        .isMongoId().withMessage('ID bến đi không hợp lệ.'),

    body('destinationStation')
        .notEmpty().withMessage('Bến đến là bắt buộc.')
        .isMongoId().withMessage('ID bến đến không hợp lệ.')
        // --- CUSTOM VALIDATOR ---
        // Logic kiểm tra quyền sử dụng bến xe được đặt ở đây
        .custom(async (destinationStationId, { req }) => {
            // Chỉ áp dụng logic này cho Provider
            if (req.user.role !== 'provider') {
                return true;
            }

            const originStationId = req.body.originStation;
            const providerId = req.provider._id; // Middleware isProvider đã cung cấp

            // 1. Tìm cả 2 bến xe trong CSDL
            const stations = await Station.find({
                _id: { $in: [originStationId, destinationStationId] }
            }).lean();

            // 2. Nếu không tìm thấy đủ 2 bến xe -> lỗi
            if (stations.length !== 2) {
                return Promise.reject('Một hoặc cả hai bến xe không tồn tại.');
            }

            // 3. Kiểm tra quyền sở hữu cho từng bến xe
            for (const station of stations) {
                const isMainStation = station.type === 'main_station';
                const isOwnedByProvider = station.ownerProvider && String(station.ownerProvider) === String(providerId);

                // Nếu bến xe không phải là bến chính VÀ cũng không thuộc sở hữu của nhà xe -> lỗi
                if (!isMainStation && !isOwnedByProvider) {
                    return Promise.reject(`Bạn không có quyền sử dụng bến xe/trạm đón: "${station.name}".`);
                }
            }
            
            return true;
        })
];


exports.validateRouteUpdate = [
    // 1. Chặn việc thay đổi bến xe.
    // Nếu các trường này tồn tại trong body, báo lỗi ngay lập tức.
    body('originStation')
        .exists()
        .withMessage('Không được phép thay đổi bến đi.'),

    body('destinationStation')
        .exists()
        .withMessage('Không được phép thay đổi bến đến.'),

    // 2. Kiểm tra các trường được phép cập nhật (nếu chúng tồn tại trong body).
    body('distanceKm')
        .optional() // .optional() nghĩa là chỉ validate nếu trường này được gửi lên.
        .isFloat({ min: 0 }).withMessage('Quãng đường phải là một con số không âm.')
        .trim(),

    body('estimatedDurationMin')
        .optional() // Nếu không có trường này trong body thì bỏ qua.
        .isInt({ min: 0 }).withMessage('Thời gian ước tính phải là một số nguyên không âm.')
        .trim(),
];