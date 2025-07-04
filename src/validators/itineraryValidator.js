const { body, param } = require('express-validator');
const Itinerary = require('../models/itinerary');
const Route = require('../models/route');
const Station = require('../models/station');
const AppError = require('../utils/appError');

/**
 * Hàm helper để kiểm tra xem một Route có hợp lệ cho Provider sử dụng không.
 */
const isRouteUsableByProvider = async (routeId, { req }) => {
    const route = await Route.findById(routeId);
    if (!route) {
        return Promise.reject('Tuyến đường khung (baseRoute) không tồn tại.');
    }
    // Hợp lệ nếu là tuyến hệ thống (null) hoặc là tuyến của chính nhà xe
    if (route.ownerProvider && String(route.ownerProvider) !== String(req.provider._id)) {
        return Promise.reject('Bạn không có quyền sử dụng tuyến đường khung này.');
    }
    return true;
};

/**
 * Hàm helper để kiểm tra xem một mảng các điểm dừng có hợp lệ không.
 */
const validateStopsArray = async (stops, { req }) => {
    if (!stops || stops.length < 2) {
        throw new Error('Hành trình phải có ít nhất 2 điểm dừng.');
    }

    const stationIds = new Set();
    const orders = new Set();
    const allStationIds = [];

    for (const stop of stops) {
        if (!stop.station || !stop.order) {
            throw new Error('Mỗi điểm dừng phải có "station" và "order".');
        }
        stationIds.add(stop.station);
        orders.add(stop.order);
        allStationIds.push(stop.station);
    }

    if (stationIds.size !== stops.length) throw new Error('Không được có các điểm dừng (station) trùng lặp.');
    if (orders.size !== stops.length) throw new Error('Không được có thứ tự (order) trùng lặp.');

    // Kiểm tra quyền sử dụng của tất cả các station trong một lần truy vấn
    const foundStations = await Station.find({ _id: { $in: allStationIds } });
    if (foundStations.length !== stationIds.size) {
        throw new Error('Một hoặc nhiều điểm dừng không tồn tại.');
    }

    for (const station of foundStations) {
        const isAllowed =
            station.type === 'main_station' ||
            station.type === 'shared_point' ||
            (station.type === 'private_point' && String(station.ownerProvider) === String(req.provider._id));

        if (!isAllowed) {
            throw new Error(`Bạn không có quyền sử dụng điểm dừng '${station.name}'.`);
        }
    }
    return true;
};


exports.validateItineraryCreation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Tên hành trình không được để trống.')
        .custom(async (value, { req }) => {
            const existing = await Itinerary.findOne({ name: value, provider: req.provider._id });
            if (existing) {
                return Promise.reject('Tên hành trình này đã tồn tại.');
            }
        }),

    body('baseRoute')
        .notEmpty().withMessage('Tuyến đường khung là bắt buộc.')
        .isMongoId().withMessage('ID Tuyến đường khung không hợp lệ.')
        .custom(isRouteUsableByProvider),

    body('stops')
        .isArray().withMessage('stops phải là một mảng.')
        .custom(validateStopsArray)
];

exports.validateItineraryUpdate = [
    param('id').isMongoId().withMessage('ID Hành trình không hợp lệ.'),
    body('name')
        .trim()
        .notEmpty().withMessage('Tên hành trình không được để trống.')
        .custom(async (value, { req }) => {
            // Tìm một hành trình có cùng tên, thuộc cùng provider, NHƯNG có ID khác với cái đang sửa
            const existing = await Itinerary.findOne({
                name: value,
                provider: req.provider._id,
                _id: { $ne: req.params.id } // $ne = Not Equal
            });
            if (existing) {
                return Promise.reject('Một hành trình khác đã sử dụng tên này.');
            }
        }),
    body('baseRoute')
        .notEmpty().withMessage('Tuyến đường khung là bắt buộc.')
        .isMongoId().withMessage('ID Tuyến đường khung không hợp lệ.')
        .custom(isRouteUsableByProvider),

    body('stops')
        .isArray().withMessage('stops phải là một mảng.')
        .custom(validateStopsArray)
];