const { body } = require('express-validator');
const Station = require('../models/station'); // Import Station model

/**
 * Hàm helper để kiểm tra một station có hợp lệ cho provider sử dụng không
 */
const isStationUsableByProvider = async (stationId, { req }) => {
    const station = await Station.findById(stationId);
    if (!station) {
        return Promise.reject('Điểm đi hoặc đến không tồn tại.');
    }

    const { role, provider } = req.user;

    // Admin có toàn quyền
    if (role === 'admin') return true;

    // Provider được dùng bến xe chính, điểm chung, hoặc điểm riêng của họ
    if (
        station.type === 'main_station' ||
        station.type === 'shared_point' ||
        (station.type === 'private_point' && String(station.ownerProvider) === String(provider._id))
    ) {
        return true;
    }

    return Promise.reject('Bạn không có quyền sử dụng điểm đi hoặc đến đã chọn.');
};

exports.validateRouteCreation = [
    body('originStation')
        .notEmpty().withMessage('Điểm đi là bắt buộc.')
        .isMongoId().withMessage('ID Điểm đi không hợp lệ.')
        .custom(isStationUsableByProvider), // <-- ÁP DỤNG LOGIC KIỂM TRA MỚI

    body('destinationStation')
        .notEmpty().withMessage('Điểm đến là bắt buộc.')
        .isMongoId().withMessage('ID Điểm đến không hợp lệ.')
        .custom(isStationUsableByProvider), // <-- ÁP DỤNG LOGIC KIỂM TRA MỚI

    body('distanceKm').optional().isFloat({ gt: 0 }).withMessage('Khoảng cách phải là số dương.'),
    body('estimatedDurationMin').optional().isInt({ gt: 0 }).withMessage('Thời gian phải là số nguyên dương.')
];

exports.validateRouteUpdate = [
    body('distanceKm').optional().isFloat({ gt: 0 }).withMessage('Khoảng cách phải là số dương.'),
    body('estimatedDurationMin').optional().isInt({ gt: 0 }).withMessage('Thời gian phải là số nguyên dương.')
];