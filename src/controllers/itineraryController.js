const Itinerary = require('../models/itinerary');
const Trip = require('../models/trip');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Lấy tất cả hành trình của nhà xe đang đăng nhập
exports.getAllItineraries = catchAsync(async (req, res, next) => {
    const itineraries = await Itinerary.find({ provider: req.provider._id })
        .populate({
            path: 'baseRoute',
            populate: [
                { path: 'originStation', select: 'name city' },
                { path: 'destinationStation', select: 'name city' },
                { path: 'ownerProvider', select: 'name' }
            ]
        })
        .populate('stops.station', 'name address');
    
    res.status(200).json({
        success: true,
        count: itineraries.length,
        data: itineraries
    });
});

// Tạo một hành trình mới
exports.createItinerary = catchAsync(async (req, res, next) => {
    const { name, baseRoute, stops } = req.body;

    // Logic validation sẽ được xử lý ở file validator riêng
    const newItinerary = await Itinerary.create({
        name,
        baseRoute,
        stops,
        provider: req.provider._id
    });

    res.status(201).json({ success: true, data: newItinerary });
});

// Lấy chi tiết một hành trình
exports.getItineraryById = catchAsync(async (req, res, next) => {
    const itinerary = await Itinerary.findOne({ _id: req.params.id, provider: req.provider._id })
        .populate({
            path: 'baseRoute',
            populate: { path: 'originStation destinationStation', select: 'name city' }
        })
        .populate('stops.station', 'name address');

    if (!itinerary) {
        return next(new AppError('Không tìm thấy hành trình hoặc bạn không có quyền truy cập.', 404));
    }

    res.status(200).json({ success: true, data: itinerary });
});


// Cập nhật một hành trình
exports.updateItinerary = catchAsync(async (req, res, next) => {
    const { name, baseRoute, stops } = req.body;
    
    const updatedItinerary = await Itinerary.findOneAndUpdate(
        { _id: req.params.id, provider: req.provider._id },
        { name, baseRoute, stops },
        { new: true, runValidators: true }
    );

    if (!updatedItinerary) {
        return next(new AppError('Không tìm thấy hành trình hoặc bạn không có quyền cập nhật.', 404));
    }

    res.status(200).json({ success: true, data: updatedItinerary });
});

// Xóa một hành trình
exports.deleteItinerary = catchAsync(async (req, res, next) => {
    const itineraryId = req.params.id;

    // Kiểm tra xem có chuyến đi nào đang sử dụng hành trình này không
    const activeTrip = await Trip.findOne({ itinerary: itineraryId });
    if (activeTrip) {
        return next(new AppError('Không thể xóa hành trình này vì đang có chuyến đi sử dụng.', 400));
    }

    const itinerary = await Itinerary.findOneAndDelete({ _id: itineraryId, provider: req.provider._id });

    if (!itinerary) {
        return next(new AppError('Không tìm thấy hành trình hoặc bạn không có quyền xóa.', 404));
    }

    res.status(204).json({ success: true, data: null });
});