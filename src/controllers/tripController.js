// src/controllers/tripController.js
const Trip = require('../models/trip');
const Itinerary = require('../models/itinerary');
const Vehicle = require('../models/vehicle');
const Driver = require('../models/driver');
const Station = require('../models/station');
const Route = require('../models/route');
const Ticket = require('../models/ticket'); // Đảm bảo import Ticket
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');


const sortPriceMatrix = (priceMatrix) => {
    if (!priceMatrix) return [];
    return priceMatrix.sort((a, b) => {
        const originCmp = String(a.originStop).localeCompare(String(b.originStop));
        if (originCmp !== 0) return originCmp;
        return String(a.destinationStop).localeCompare(String(b.destinationStop));
    });
};

/**
 * TẠO MỘT CHUYẾN ĐI MỚI
 */
const createTrip = catchAsync(async (req, res, next) => {
    // Lấy itinerary đã được validate từ req.itinerary
    const itinerary = req.itinerary; // Đã được set bởi tripValidator
    const { vehicleId, driverId, priceMatrix, schedule } = req.body;

    // 1. Kiểm tra các tài nguyên Vehicle và Driver có tồn tại và thuộc sở hữu của provider không
    // (Itinerary đã được kiểm tra trong validator)
    const [vehicle, driver] = await Promise.all([
        Vehicle.findOne({ _id: vehicleId, provider: req.provider._id }),
        Driver.findOne({ _id: driverId, provider: req.provider._id })
    ]);

    if (!vehicle) return next(new AppError('Xe không hợp lệ hoặc không thuộc sở hữu của bạn.', 404));
    if (!driver) return next(new AppError('Tài xế không hợp lệ hoặc không thuộc sở hữu của bạn.', 404));

    // Lấy departureTime và arrivalTime từ schedule đã được validate
    const departureTime = schedule[0].estimatedDepartureTime;
    const arrivalTime = schedule[schedule.length - 1].estimatedArrivalTime;

    const sortedPriceMatrix = sortPriceMatrix(priceMatrix); // SẮP XẾP TRƯỚC KHI TẠO

    // 2. Xây dựng dữ liệu cho chuyến đi mới
    const tripData = {
        itinerary: itinerary._id, // Sử dụng ID từ itinerary đã được xác thực
        vehicle: vehicleId,
        driver: driverId,
        provider: req.provider._id,
        priceMatrix: sortedPriceMatrix, // SỬ DỤNG MẢNG ĐÃ SẮP XẾP
        schedule,
        departureTime, // Lấy từ schedule
        arrivalTime,   // Lấy từ schedule
    };

    const newTrip = await Trip.create(tripData);
    res.status(201).json({ success: true, data: newTrip });
});


/**
 * LẤY DANH SÁCH CHUYẾN ĐI (CÓ PHÂN TRANG)
 */
// src/controllers/tripController.js

// ... (các import và hàm khác)

/**
 * LẤY DANH SÁCH CHUYẾN ĐI (CÓ PHÂN TRANG)
 */
const getAllTrips = catchAsync(async (req, res, next) => {
    let filter = {};
    const { role } = req.user;

    if (role === 'provider') {
        filter.provider = req.provider._id;
    } else if (role === 'admin' && req.query.provider) {
        filter.provider = req.query.provider;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = Trip.find(filter);

    // Populate itinerary fully, and its nested baseRoute and stops.station
    query = query.populate({
        path: 'itinerary',
        populate: [
            {
                path: 'baseRoute',
                populate: [
                    { path: 'originStation', select: 'name city' },
                    { path: 'destinationStation', select: 'name city' },
                    { path: 'ownerProvider', select: 'name' }
                ]
            },
            // 2. THÊM POPULATE NÀY: Populate các Station bên trong mảng 'stops' của Itinerary
            {
                path: 'stops.station', // Đường dẫn đúng để populate station trong mỗi stop
                select: 'name address city type' // Chọn các trường cần thiết cho Station.kt của bạn (Không có coordinates)
            }
        ]
    })
    // ... (các populate cho vehicle, driver, provider hiện có)
    .populate({
        path: 'vehicle',
        // CHỈ POPULATE CÁC TRƯỜNG MÀ FRONTEND (VehicleTripNested.kt) CẦN
        // Hiện tại là 'type' và 'licensePlate'.
        // Không populate currentStation hay provider ở đây, vì VehicleTripNested không cần.
        // Nếu bạn muốn hiển thị currentStation/provider trong Trip list, bạn sẽ phải populate chúng ở đây
        // và thêm chúng vào VehicleTripNested.kt
        select: 'type licensePlate' // Chỉ lấy các trường này
    })
    .populate({
        path: 'driver',
        // CHỈ POPULATE CÁC TRƯỜNG MÀ FRONTEND (DriverTripNested.kt) CẦN
        select: 'name' // Chỉ lấy tên
    })
    .populate('provider', 'name'); // Populate provider của Trip

    const [trips, totalCount] = await Promise.all([
        query.sort({ departureTime: -1 }).skip(skip).limit(limit).lean(),
        Trip.countDocuments(filter)
    ]);

    // === BƯỚC MỚI: SẮP XẾP priceMatrix TRƯỚC KHI GỬI ĐI ===
   // === BƯỚC MỚI: SẮP XẾP priceMatrix TRƯỚC KHI GỬI ĐI ===
    const finalTrips = trips.map(trip => {
        const sanitizedTrip = { ...trip };
        if (sanitizedTrip.priceMatrix) {
            sanitizedTrip.priceMatrix = sortPriceMatrix(sanitizedTrip.priceMatrix);
        }
        // ... (Sanitization cho ownerProvider nếu cần)
        if (sanitizedTrip.itinerary && sanitizedTrip.itinerary.baseRoute &&
            sanitizedTrip.itinerary.baseRoute.ownerProvider && typeof sanitizedTrip.itinerary.baseRoute.ownerProvider === 'string') {
            sanitizedTrip.itinerary = {
                ...sanitizedTrip.itinerary,
                baseRoute: {
                    ...sanitizedTrip.itinerary.baseRoute,
                    ownerProvider: null
                }
            };
        }
        return sanitizedTrip;
    });
    // ====================================================================================================

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
        success: true,
        pagination: { totalCount, totalPages, currentPage: page },
        data: finalTrips // TRẢ VỀ DỮ LIỆU ĐÃ SẮP XẾP VÀ LÀM SẠCH
    });
});


/**
 * LẤY CHI TIẾT MỘT CHUYẾN ĐI
 */
const getTripById = catchAsync(async (req, res, next) => {
    const { role } = req.user;
    let query = { _id: req.params.id };

    if (role === 'provider') {
        query.provider = req.provider._id;
    }

    const trip = await Trip.findOne(query)
        .populate({
            path: 'itinerary',
            populate: { path: 'stops.station baseRoute', populate: { path: 'originStation destinationStation', select: 'name city' } }
        })
        .populate('vehicle')
        .populate('driver')
        .lean();


    if (!trip) {
        return next(new AppError('Không tìm thấy chuyến đi hoặc bạn không có quyền truy cập.', 404));
    }

    // SẮP XẾP priceMatrix TRƯỚC KHI GỬI ĐI
    if (trip.priceMatrix) {
        trip.priceMatrix = sortPriceMatrix(trip.priceMatrix);
    }
    // ... (Sanitization cho ownerProvider)
    if (trip.itinerary && trip.itinerary.baseRoute &&
        trip.itinerary.baseRoute.ownerProvider && typeof trip.itinerary.baseRoute.ownerProvider === 'string') {
        trip.itinerary.baseRoute.ownerProvider = null;
    }


    res.status(200).json({ success: true, data: trip });
});

/**
 * CẬP NHẬT MỘT CHUYẾN ĐI
 * (Cho phép cập nhật toàn bộ mảng priceMatrix/schedule nếu được cung cấp)
 * departureTime và arrivalTime sẽ tự động được cập nhật lại nếu schedule được cập nhật.
 */
const updateTrip = catchAsync(async (req, res, next) => {
    const allowedUpdates = ['itineraryId', 'vehicleId', 'driverId', 'status', 'priceMatrix', 'schedule']; // departureTime và arrivalTime không còn trong đây
    const updateData = {};

    Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
            if (key === 'itineraryId') {
                updateData.itinerary = req.body[key];
            } else if (key === 'vehicleId') {
                updateData.vehicle = req.body[key];
            } else if (key === 'driverId') {
                updateData.driver = req.body[key];
            } else if (key === 'priceMatrix') {
                updateData.priceMatrix = sortPriceMatrix(req.body[key]); // SẮP XẾP TRƯỚC KHI CẬP NHẬT
            }
            else {
                updateData[key] = req.body[key];
            }
        }
    });
    
    // Nếu schedule được cập nhật, tự động cập nhật departureTime và arrivalTime
    if (updateData.schedule && updateData.schedule.length >= 2) {
        updateData.departureTime = updateData.schedule[0].estimatedDepartureTime;
        updateData.arrivalTime = updateData.schedule[updateData.schedule.length - 1].estimatedArrivalTime;
    } else if (updateData.schedule && updateData.schedule.length < 2) {
        // Xử lý trường hợp schedule không hợp lệ (lẽ ra đã bị bắt bởi validator)
        return next(new AppError('Lịch trình phải có ít nhất 2 điểm dừng.', 400));
    }

    if (Object.keys(updateData).length === 0) {
        return next(new AppError('Không có dữ liệu hợp lệ để cập nhật.', 400));
    }

    let query = { _id: req.params.id };
    if (req.user.role === 'provider') {
        query.provider = req.provider._id;
    }

    // Kiểm tra quyền sở hữu cho vehicle và driver nếu chúng được cập nhật
    if (updateData.vehicle) {
        const vehicle = await Vehicle.findOne({ _id: updateData.vehicle, provider: req.provider._id });
        if (!vehicle) return next(new AppError('Xe không hợp lệ hoặc không thuộc sở hữu của bạn.', 404));
    }
    if (updateData.driver) {
        const driver = await Driver.findOne({ _id: updateData.driver, provider: req.provider._id });
        if (!driver) return next(new AppError('Tài xế không hợp lệ hoặc không thuộc sở hữu của bạn.', 404));
    }

    const updatedTrip = await Trip.findOneAndUpdate(query, updateData, { new: true, runValidators: true });

    if (!updatedTrip) {
        return next(new AppError('Không tìm thấy chuyến đi hoặc bạn không có quyền cập nhật.', 404));
    }

    res.status(200).json({ success: true, data: updatedTrip });
});

/**
 * XÓA MỘT CHUYẾN ĐI
 */
const deleteTrip = catchAsync(async (req, res, next) => {
    let query = { _id: req.params.id };
    if (req.user.role === 'provider') {
        query.provider = req.provider._id;
    }

    const trip = await Trip.findOneAndDelete(query);


    if (!trip) {
        return next(new AppError('Không tìm thấy chuyến đi hoặc bạn không có quyền xóa.', 404));
    }

    res.status(204).json({ success: true, data: null });
});


// src/controllers/tripController.js

// ... (các hàm và import khác)

/**
 * TÌM KIẾM CHUYẾN ĐI (PUBLIC API) - ĐÃ TỐI ƯU HÓA BẰNG AGGREGATION PIPELINE
 */
const searchTrips = catchAsync(async (req, res, next) => {
    const { originCity, destinationCity, departureDate } = req.query;

    const queryDate = new Date(departureDate); // Ngày mà người dùng muốn khởi hành
    queryDate.setUTCHours(0, 0, 0, 0); // Đảm bảo chỉ lấy ngày

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let minDepartureTimeForSearch = new Date(queryDate);
    // Nếu ngày tìm kiếm là hôm nay, thời gian tối thiểu phải là hiện tại + 1 ngày
    // Chuyến đi phải khởi hành ít nhất 1 ngày sau thời điểm hiện tại tại điểm dừng
    if (queryDate.getTime() === today.getTime()) {
         minDepartureTimeForSearch = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tối thiểu 24 giờ sau hiện tại
    }

    const maxDepartureTimeForSearch = new Date(queryDate);
    maxDepartureTimeForSearch.setUTCHours(23, 59, 59, 999); // Cuối ngày tìm kiếm

    const pipeline = [
        // Giai đoạn 1: Lọc các chuyến đi theo trạng thái và ngày khởi hành TẠI ĐIỂM DỪNG ĐẦU TIÊN CỦA CHẶNG TÌM KIẾM
        {
            $match: {
                status: { $in: ['scheduled', 'in-progress'] }, // Cho phép tìm cả scheduled và in-progress
                // Các chuyến đi phải có ít nhất một điểm dừng trong schedule có thời gian đi trong khoảng tìm kiếm
                'schedule.estimatedDepartureTime': {
                    $gte: minDepartureTimeForSearch,
                    $lte: maxDepartureTimeForSearch
                }
            }
        },

        // Giai đoạn 2: Lấy thông tin Itinerary
        {
            $lookup: {
                from: 'itineraries',
                localField: 'itinerary',
                foreignField: '_id',
                as: 'itineraryDetails'
            }
        },
        {
            $unwind: '$itineraryDetails'
        },
        // Giai đoạn 3: Lấy thông tin các Station trong Itinerary.stops
        {
            $lookup: {
                from: 'stations',
                localField: 'itineraryDetails.stops.station',
                foreignField: '_id',
                as: 'itineraryStations'
            }
        },
        // Giai đoạn 4: Lấy thông tin các Station trong schedule (đã có)
        {
            $lookup: {
                from: 'stations',
                localField: 'schedule.station',
                foreignField: '_id',
                as: 'scheduleStations'
            }
        },
        // Giai đoạn 5: Lọc theo thành phố đi và đến
        {
            $addFields: {
                originStationIdsByCity: {
                    $map: {
                        input: {
                            $filter: {
                                input: '$itineraryStations',
                                as: 'station',
                                cond: { $eq: ['$$station.city', originCity] }
                            }
                        },
                        as: 'filteredStation',
                        in: '$$filteredStation._id'
                    }
                },
                destinationStationIdsByCity: {
                    $map: {
                        input: {
                            $filter: {
                                input: '$itineraryStations',
                                as: 'station',
                                cond: { $eq: ['$$station.city', destinationCity] }
                            }
                        },
                        as: 'filteredStation',
                        in: '$$filteredStation._id'
                    }
                }
            }
        },
        {
            $match: {
                'originStationIdsByCity.0': { $exists: true },
                'destinationStationIdsByCity.0': { $exists: true }
            }
        },

        // Giai đoạn 6: Kiểm tra thứ tự các điểm dừng trong schedule và thời gian khởi hành hợp lệ
        {
            $addFields: {
                // Tạo một mảng các schedule entries hợp lệ (origin stop)
                validOriginScheduleEntries: {
                    $filter: {
                        input: '$schedule',
                        as: 'sch',
                        cond: {
                            $and: [
                                { $in: ['$$sch.station', '$originStationIdsByCity'] },
                                { $gte: ['$$sch.estimatedDepartureTime', minDepartureTimeForSearch] }, // Phải khởi hành sau thời gian tối thiểu
                                { $lte: ['$$sch.estimatedDepartureTime', maxDepartureTimeForSearch] }  // Và trước thời gian tối đa
                            ]
                        }
                    }
                },
                // Tạo một mảng các schedule entries hợp lệ (destination stop)
                validDestinationScheduleEntries: {
                    $filter: {
                        input: '$schedule',
                        as: 'sch',
                        cond: {
                            $in: ['$$sch.station', '$destinationStationIdsByCity']
                        }
                    }
                }
            }
        },
        {
            $match: {
                'validOriginScheduleEntries.0': { $exists: true }, // Phải có ít nhất 1 điểm đi hợp lệ trong schedule
                'validDestinationScheduleEntries.0': { $exists: true } // Phải có ít nhất 1 điểm đến hợp lệ trong schedule
            }
        },
        {
            $addFields: {
                // Tìm vị trí (index) của điểm đi đầu tiên và điểm đến cuối cùng HỢP LỆ trong schedule
                firstValidOriginIndex: {
                    $indexOfArray: [
                        '$schedule.station',
                        { $arrayElemAt: ['$validOriginScheduleEntries.station', 0] } // ID của điểm đi đầu tiên hợp lệ
                    ]
                },
                lastValidDestinationIndex: {
                    $lastIndexOfArray: [
                        '$schedule.station',
                        { $arrayElemAt: ['$validDestinationScheduleEntries.station', { $subtract: [{ $size: '$validDestinationScheduleEntries' }, 1] }] } // ID của điểm đến cuối cùng hợp lệ
                    ]
                }
            }
        },
        {
            $match: {
                // Đảm bảo điểm đi hợp lệ xuất hiện trước điểm đến hợp lệ
                $expr: { $lt: ['$firstValidOriginIndex', '$lastValidDestinationIndex'] }
            }
        },

        // Giai đoạn 7: Tính toán giá cho phân đoạn đã chọn
        {
            $addFields: {
                priceForSelectedSegment: {
                    $let: {
                        vars: {
                            matchedPriceEntry: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: '$priceMatrix',
                                            as: 'priceEntry',
                                            cond: {
                                                $and: [
                                                    { $in: ['$$priceEntry.originStop', '$originStationIdsByCity'] },
                                                    { $in: ['$$priceEntry.destinationStop', '$destinationStationIdsByCity'] }
                                                ]
                                            }
                                        }
                                    },
                                    0
                                ]
                            }
                        },
                        in: '$$matchedPriceEntry.price'
                    }
                }
            }
        },
        // Giai đoạn 8: Populate Vehicle, Driver, Provider
        {
            $lookup: {
                from: 'vehicles',
                localField: 'vehicle',
                foreignField: '_id',
                as: 'vehicleDetails'
            }
        },
        {
            $unwind: { path: '$vehicleDetails', preserveNullAndEmptyArrays: true }
        },
        {
            $lookup: {
                from: 'drivers',
                localField: 'driver',
                foreignField: '_id',
                as: 'driverDetails'
            }
        },
        {
            $unwind: { path: '$driverDetails', preserveNullAndEmptyArrays: true }
        },
        {
            $lookup: {
                from: 'providers',
                localField: 'provider',
                foreignField: '_id',
                as: 'providerDetails'
            }
        },
        {
            $unwind: { path: '$providerDetails', preserveNullAndEmptyArrays: true }
        },
        // Giai đoạn 9: Project các trường cần thiết và định dạng lại output
        {
            $project: {
                _id: 1,
                itinerary: {
                    _id: '$itineraryDetails._id',
                    name: '$itineraryDetails.name',
                    stops: {
                        $map: {
                            input: '$itineraryDetails.stops',
                            as: 'stop',
                            in: {
                                station: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$itineraryStations',
                                                as: 's',
                                                cond: { $eq: ['$$s._id', '$$stop.station'] }
                                            }
                                        },
                                        0
                                    ]
                                },
                                order: '$$stop.order'
                            }
                        }
                    }
                },
                vehicle: {
                    _id: '$vehicleDetails._id',
                    type: '$vehicleDetails.type',
                    licensePlate: '$vehicleDetails.licensePlate',
                    capacity: '$vehicleDetails.capacity'
                },
                driver: {
                    _id: '$driverDetails._id',
                    name: '$driverDetails.name'
                },
                provider: {
                    _id: '$providerDetails._id',
                    name: '$providerDetails.name'
                },
                priceMatrix: 1,
                schedule: 1,
                departureTime: 1, // Tổng thời gian đi của chuyến
                arrivalTime: 1, // Tổng thời gian đến của chuyến
                status: 1,
                priceForSelectedSegment: 1, // Giá cho chặng tìm kiếm
                // Có thể thêm thông tin thời gian cụ thể cho chặng tìm kiếm
                // estimatedDepartureTimeFromOriginCity: { $arrayElemAt: ['$validOriginScheduleEntries.estimatedDepartureTime', 0] },
                // estimatedArrivalTimeToDestinationCity: { $arrayElemAt: ['$validDestinationScheduleEntries.estimatedArrivalTime', { $subtract: [{ $size: '$validDestinationScheduleEntries' }, 1] }] }
            }

        }
    ];

    const trips = await Trip.aggregate(pipeline);

    res.status(200).json({ success: true, data: trips });
});


const getTicketsForTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const tickets = await Ticket.aggregate([
            { $match: { trip: new mongoose.Types.ObjectId(tripId) } },
            { $addFields: { seatNumberNumeric: { $toInt: "$seatNumber" } } },
            { $sort: { seatNumberNumeric: 1 } },
            {
                $project: {
                    seatNumber: 1,
                    status: 1,
                    price: 1
                }
            }
        ]);
        res.status(200).json({ success: true, data: tickets });
    } catch (err) {
        console.error("Error in getTicketsForTrip:", err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const getReviewsForTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [reviews, totalCount] = await Promise.all([
            Review.find({ trip: tripId })
                .populate('user', 'name') // Chỉ lấy tên của người dùng
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments({ trip: tripId })
        ]);

        res.status(200).json({
            success: true,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: reviews
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};


module.exports = {
    createTrip,
    getTripById,
    getAllTrips,
    updateTrip, 
    deleteTrip,
    searchTrips,
    getTicketsForTrip,
    getReviewsForTrip
};
