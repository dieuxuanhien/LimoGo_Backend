// src/validators/tripValidator.js
const { body, query, param } = require('express-validator');
const Itinerary = require('../models/itinerary'); // Import model Itinerary
const Route = require('../models/route'); // Import model Route
const mongoose = require('mongoose'); // Để làm việc với ObjectId

/**
 * Hàm trợ giúp để lấy Itinerary và kiểm tra quyền sở hữu.
 * Sẽ dùng trong các custom validator.
 */
const getValidatedItinerary = async (itineraryId, req) => {
    if (!mongoose.Types.ObjectId.isValid(itineraryId)) {
        throw new Error('ID hành trình không hợp lệ.');
    }
    const itinerary = await Itinerary.findById(itineraryId).lean();
    if (!itinerary) {
        throw new Error('Hành trình không tồn tại.');
    }
    // Đảm bảo hành trình thuộc sở hữu của provider đang đăng nhập
    if (req.user.role === 'provider' && String(itinerary.provider) !== String(req.provider._id)) {
        throw new Error('Bạn không có quyền sử dụng hành trình này.');
    }
    return itinerary;
};

/**
 * Validator cho việc TẠO MỚI một chuyến đi.
 * Kiểm tra cấu trúc và kiểu dữ liệu cơ bản.
 */
exports.validateCreateTrip = [
    // itineraryId - Luôn kiểm tra tồn tại và quyền sở hữu trước khi dùng cho các validation khác
    body('itineraryId')
        .notEmpty().withMessage('Hành trình là bắt buộc.')
        .isMongoId().withMessage('ID Hành trình không hợp lệ.')
        .custom(async (itineraryId, { req }) => {
            // Lưu itinerary vào req để các custom validator sau có thể tái sử dụng
            req.itinerary = await getValidatedItinerary(itineraryId, req);
            return true;
        }),

    body('vehicleId')
        .notEmpty().withMessage('Xe là bắt buộc.')
        .isMongoId().withMessage('ID Xe không hợp lệ.'),

    body('driverId')
        .notEmpty().withMessage('Tài xế là bắt buộc.')
        .isMongoId().withMessage('ID Tài xế không hợp lệ.'),

    // Validation cho priceMatrix
    body('priceMatrix')
        .isArray({ min: 1 }).withMessage('Bảng giá (priceMatrix) phải là một mảng và có ít nhất một chặng.'),
    body('priceMatrix.*.originStop')
        .isMongoId().withMessage('ID điểm đi trong bảng giá không hợp lệ.')
        .custom((originStopId, { req }) => {
            const itineraryStops = req.itinerary.stops.map(s => String(s.station));
            if (!itineraryStops.includes(String(originStopId))) {
                throw new Error(`Điểm đi '${originStopId}' trong priceMatrix không có trong hành trình đã chọn.`);
            }
            return true;
        }),
    body('priceMatrix.*.destinationStop')
        .isMongoId().withMessage('ID điểm đến trong bảng giá không hợp lệ.')
        .custom((destinationStopId, { req }) => {
            const itineraryStops = req.itinerary.stops.map(s => String(s.station));
            if (!itineraryStops.includes(String(destinationStopId))) {
                throw new Error(`Điểm đến '${destinationStopId}' trong priceMatrix không có trong hành trình đã chọn.`);
            }
            return true;
        }),
    body('priceMatrix.*.price')
        .isFloat({ min: 0 }).withMessage('Giá vé phải là một con số không âm.'),

    // Validation cho schedule
    body('schedule')
        .isArray({ min: 2 }).withMessage('Lịch trình (schedule) phải là một mảng và có ít nhất 2 điểm dừng.'),
    body('schedule.*.station')
        .isMongoId().withMessage('ID bến xe trong lịch trình không hợp lệ.')
        .custom((stationId, { req }) => {
            const itineraryStops = req.itinerary.stops.map(s => String(s.station));
            if (!itineraryStops.includes(String(stationId))) {
                throw new Error(`Điểm dừng '${stationId}' trong lịch trình không có trong hành trình đã chọn.`);
            }
            return true;
        }),
    body('schedule.*.estimatedArrivalTime')
        .isISO8601().withMessage('Thời gian đến dự kiến không hợp lệ.').toDate(),
    body('schedule.*.estimatedDepartureTime')
        .isISO8601().withMessage('Thời gian đi dự kiến không hợp lệ.').toDate(),

    // CUSTOM VALIDATOR cho toàn bộ schedule để kiểm tra thứ tự và thời gian
    body('schedule').custom((schedule, { req }) => {
        const itineraryStops = req.itinerary.stops.sort((a, b) => a.order - b.order); // Sắp xếp lại itinerary stops theo order
        const itineraryStationIdsOrdered = itineraryStops.map(s => String(s.station));

        let lastItineraryIndex = -1;
        for (let i = 0; i < schedule.length; i++) {
            const currentScheduleStationId = String(schedule[i].station);
            const currentItineraryIndex = itineraryStationIdsOrdered.indexOf(currentScheduleStationId);

            if (currentItineraryIndex === -1) {
                throw new Error(`Điểm dừng '${currentScheduleStationId}' trong lịch trình không tồn tại trong hành trình.`);
            }
            if (currentItineraryIndex <= lastItineraryIndex) {
                throw new Error(`Thứ tự các điểm dừng trong lịch trình không khớp với hành trình cơ sở. Điểm '${currentScheduleStationId}' sai vị trí.`);
            }
            lastItineraryIndex = currentItineraryIndex;

            // 2. Kiểm tra thời gian
            const arrival = schedule[i].estimatedArrivalTime;
            const departure = schedule[i].estimatedDepartureTime;

            if (!arrival || !departure) {
                throw new Error('Thời gian đến và đi dự kiến là bắt buộc cho mỗi điểm dừng.');
            }

            if (arrival > departure) {
                throw new Error(`Thời gian đến dự kiến (${arrival.toISOString()}) phải TRƯỚC hoặc BẰNG thời gian đi dự kiến (${departure.toISOString()}) tại điểm dừng '${currentScheduleStationId}'.`);
            }

            if (i > 0) {
                const prevDeparture = schedule[i - 1].estimatedDepartureTime;
                if (departure < prevDeparture) {
                    throw new Error(`Thời gian đi dự kiến của điểm dừng '${currentScheduleStationId}' (${departure.toISOString()}) phải SAU thời gian đi dự kiến của điểm dừng trước đó (${prevDeparture.toISOString()}).`);
                }
            }
        }
        return true;
    })
];

/**
 * Validator cho việc CẬP NHẬT một chuyến đi.
 * Các trường đều là tùy chọn.
 */
exports.validateUpdateTrip = [
    param('id').isMongoId().withMessage('ID Chuyến đi không hợp lệ.'),

    // Nếu itineraryId được cập nhật, cần xác thực lại và lưu vào req
    body('itineraryId')
        .optional()
        .isMongoId().withMessage('ID Hành trình không hợp lệ.')
        .custom(async (itineraryId, { req }) => {
            req.itinerary = await getValidatedItinerary(itineraryId, req);
            return true;
        }),

    body('vehicleId').optional().isMongoId().withMessage('ID Xe không hợp lệ.'),
    body('driverId').optional().isMongoId().withMessage('ID Tài xế không hợp lệ.'),
    body('status').optional().isIn(['scheduled', 'in-progress', 'completed', 'cancelled']).withMessage('Trạng thái không hợp lệ.'),

    // Validation cho priceMatrix (nếu được cung cấp để cập nhật toàn bộ mảng)
    body('priceMatrix')
        .optional()
        .isArray({ min: 1 }).withMessage('Bảng giá (priceMatrix) phải là một mảng và có ít nhất một chặng.'),
    body('priceMatrix.*.originStop')
        .isMongoId().withMessage('ID điểm đi trong bảng giá không hợp lệ.')
        .custom(async (originStopId, { req }) => {
            // Nếu itineraryId không được cập nhật, lấy itinerary từ trip hiện tại
            if (!req.itinerary) {
                const trip = await mongoose.model('Trip').findById(req.params.id).lean();
                if (!trip) throw new Error('Không tìm thấy chuyến đi để xác thực priceMatrix.');
                req.itinerary = await getValidatedItinerary(trip.itinerary, req);
            }
            const itineraryStops = req.itinerary.stops.map(s => String(s.station));
            if (!itineraryStops.includes(String(originStopId))) {
                throw new Error(`Điểm đi '${originStopId}' trong priceMatrix không có trong hành trình đã chọn.`);
            }
            return true;
        }),
    body('priceMatrix.*.destinationStop')
        .isMongoId().withMessage('ID điểm đến trong bảng giá không hợp lệ.')
        .custom(async (destinationStopId, { req }) => {
            if (!req.itinerary) {
                const trip = await mongoose.model('Trip').findById(req.params.id).lean();
                if (!trip) throw new Error('Không tìm thấy chuyến đi để xác thực priceMatrix.');
                req.itinerary = await getValidatedItinerary(trip.itinerary, req);
            }
            const itineraryStops = req.itinerary.stops.map(s => String(s.station));
            if (!itineraryStops.includes(String(destinationStopId))) {
                throw new Error(`Điểm đến '${destinationStopId}' trong priceMatrix không có trong hành trình đã chọn.`);
            }
            return true;
        }),
    body('priceMatrix.*.price')
        .isFloat({ min: 0 }).withMessage('Giá vé phải là một con số không âm.'),

    // Validation cho schedule (nếu được cung cấp để cập nhật toàn bộ mảng)
    body('schedule')
        .optional()
        .isArray({ min: 2 }).withMessage('Lịch trình (schedule) phải là một mảng và có ít nhất 2 điểm dừng.'),
    body('schedule.*.station')
        .isMongoId().withMessage('ID bến xe trong lịch trình không hợp lệ.')
        .custom(async (stationId, { req }) => {
            if (!req.itinerary) {
                const trip = await mongoose.model('Trip').findById(req.params.id).lean();
                if (!trip) throw new Error('Không tìm thấy chuyến đi để xác thực lịch trình.');
                req.itinerary = await getValidatedItinerary(trip.itinerary, req);
            }
            const itineraryStops = req.itinerary.stops.map(s => String(s.station));
            if (!itineraryStops.includes(String(stationId))) {
                throw new Error(`Điểm dừng '${stationId}' trong lịch trình không có trong hành trình đã chọn.`);
            }
            return true;
        }),
    body('schedule.*.estimatedArrivalTime')
        .isISO8601().withMessage('Thời gian đến dự kiến không hợp lệ.').toDate(),
    body('schedule.*.estimatedDepartureTime')
        .isISO8601().withMessage('Thời gian đi dự kiến không hợp lệ.').toDate(),

    // CUSTOM VALIDATOR cho toàn bộ schedule để kiểm tra thứ tự và thời gian (tương tự create)
    body('schedule').optional().custom(async (schedule, { req }) => {
        if (!req.itinerary) {
            // Nếu itineraryId không được cập nhật, ta cần tìm lại itinerary của chuyến đi hiện tại
            const trip = await mongoose.model('Trip').findById(req.params.id).lean();
            if (!trip) throw new Error('Không tìm thấy chuyến đi để xác thực lịch trình.');
            req.itinerary = await getValidatedItinerary(trip.itinerary, req);
        }

        const itineraryStops = req.itinerary.stops.sort((a, b) => a.order - b.order);
        const itineraryStationIdsOrdered = itineraryStops.map(s => String(s.station));

        let lastItineraryIndex = -1;
        for (let i = 0; i < schedule.length; i++) {
            const currentScheduleStationId = String(schedule[i].station);
            const currentItineraryIndex = itineraryStationIdsOrdered.indexOf(currentScheduleStationId);

            if (currentItineraryIndex === -1) {
                throw new Error(`Điểm dừng '${currentScheduleStationId}' trong lịch trình không tồn tại trong hành trình đã chọn.`);
            }
            if (currentItineraryIndex <= lastItineraryIndex) {
                throw new Error(`Thứ tự các điểm dừng trong lịch trình không khớp với hành trình cơ sở. Điểm '${currentScheduleStationId}' sai vị trí.`);
            }
            lastItineraryIndex = currentItineraryIndex;

            const arrival = schedule[i].estimatedArrivalTime;
            const departure = schedule[i].estimatedDepartureTime;

            if (arrival > departure) {
                throw new Error(`Thời gian đến dự kiến (${arrival.toISOString()}) phải TRƯỚC hoặc BẰNG thời gian đi dự kiến (${departure.toISOString()}) tại điểm dừng '${currentScheduleStationId}'.`);
            }

            if (i > 0) {
                const prevDeparture = schedule[i - 1].estimatedDepartureTime;
                if (departure < prevDeparture) {
                    throw new Error(`Thời gian đi dự kiến của điểm dừng '${currentScheduleStationId}' (${departure.toISOString()}) phải SAU thời gian đi dự kiến của điểm dừng trước đó (${prevDeparture.toISOString()}).`);
                }
            }
        }
        return true;
    })
];

/**
 * Validator cho việc TÌM KIẾM chuyến đi công khai.
 */
exports.validateSearchTrip = [
    query('originCity').notEmpty().withMessage('Thành phố đi là bắt buộc.'),
    query('destinationCity').notEmpty().withMessage('Thành phố đến là bắt buộc.'),
    query('departureDate').notEmpty().withMessage('Ngày đi là bắt buộc.').isISO8601().withMessage('Định dạng ngày đi không hợp lệ.'),
];