const Route = require('../models/route');
const Itinerary = require('../models/itinerary');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Lấy danh sách các tuyến đường (có phân trang).
 * - Provider: Thấy các tuyến của hệ thống và của riêng mình.
 * - Admin: Thấy tất cả các tuyến.
 */
// src/controllers/routeController.js

// ... (các hàm và import khác)

exports.getAllRoutes = catchAsync(async (req, res, next) => {
    let filter = {};
    const { role } = req.user;

    if (role === 'provider') {
        filter = {
            $or: [
                { ownerProvider: null }, // Tuyến của hệ thống
                { ownerProvider: req.provider._id } // Tuyến của riêng họ
            ]
        };
    }

    // === THÊM CÁC BIẾN PHÂN TRANG VÀO ĐÂY ===
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // ========================================

    let query = Route.find(filter);

    if (role !== 'admin') {
        query = query.populate({ path: 'originStation', select: 'name city' })
                     .populate({ path: 'destinationStation', select: 'name city' })
                     .populate({ path: 'ownerProvider', select: 'name' });
    }

    const [routes, totalCount] = await Promise.all([
        query.sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Route.countDocuments(filter)
    ]);

    // === ĐẢM BẢO RESPONSE CHỨA PAGINATION DATA ===
    const totalPages = Math.ceil(totalCount / limit); // Giờ 'limit' đã định nghĩa

    const sanitizedRoutes = routes.map(route => {
        if (route.ownerProvider && typeof route.ownerProvider === 'string') {
            return { ...route, ownerProvider: null };
        }
        return route;
    });

    res.status(200).json({
        success: true,
        totalCount, // Thêm totalCount
        totalPages, // Thêm totalPages
        currentPage: page, // Thêm currentPage
        data: sanitizedRoutes // TRẢ VỀ DỮ LIỆU ĐÃ LÀM SẠCH
    });
});

/**
 * Lấy chi tiết một tuyến đường.
 */
exports.getRouteById = catchAsync(async (req, res, next) => {
    const route = await Route.findById(req.params.id)
        .populate('originStation destinationStation');

    if (!route) {
        return next(new AppError('Không tìm thấy tuyến đường với ID này', 404));
    }

    if (req.user.role === 'provider' && route.ownerProvider && String(route.ownerProvider) !== String(req.provider._id)) {
        return next(new AppError('Bạn không có quyền xem tuyến đường này.', 403));
    }

    res.status(200).json({ success: true, data: route });
});

/**
 * Tạo một tuyến đường mới.
 */
exports.createRoute = catchAsync(async (req, res, next) => {
    const { originStation, destinationStation, distanceKm, estimatedDurationMin } = req.body;
    const routeData = { originStation, destinationStation, distanceKm, estimatedDurationMin };

    if (req.user.role === 'provider') {
        routeData.ownerProvider = req.provider._id;
    }

    const newRoute = await Route.create(routeData);
    res.status(201).json({
        success: true,
        message: 'Tạo tuyến đường thành công!',
        data: newRoute
    });
});

/**
 * Cập nhật một tuyến đường.
 * Chỉ cho phép cập nhật các thông tin phụ.
 */
exports.updateRoute = catchAsync(async (req, res, next) => {
    const allowedUpdates = ['distanceKm', 'estimatedDurationMin'];
    const updateData = {};

    Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
            updateData[key] = req.body[key];
        }
    });

    if (Object.keys(updateData).length === 0) {
        return next(new AppError('Không có dữ liệu hợp lệ để cập nhật.', 400));
    }

    let query;
    if (req.user.role === 'provider') {
        query = { _id: req.params.id, ownerProvider: req.provider._id };
    } else {
        query = { _id: req.params.id };
    }

    const updatedRoute = await Route.findOneAndUpdate(query, updateData, {
        new: true,
        runValidators: true
    });

    if (!updatedRoute) {
        return next(new AppError('Không tìm thấy tuyến đường hoặc bạn không có quyền cập nhật.', 404));
    }

    res.status(200).json({ success: true, data: updatedRoute });
});

/**
 * Xóa một tuyến đường.
 */
exports.deleteRoute = catchAsync(async (req, res, next) => {
    const routeId = req.params.id;
    const routeToDelete = await Route.findById(routeId);

    if (!routeToDelete) {
        return next(new AppError('Không tìm thấy tuyến đường với ID này.', 404));
    }

    if (req.user.role === 'provider' && String(routeToDelete.ownerProvider) !== String(req.provider._id)) {
        return next(new AppError('Bạn không có quyền xóa tuyến đường này.', 403));
    }

    const activeItinerary = await Itinerary.findOne({ baseRoute: routeId });
    if (activeItinerary) {
        return next(new AppError('Không thể xóa tuyến đường này vì đang có Hành trình sử dụng nó.', 400));
    }

    await Route.findByIdAndDelete(routeId);
    res.status(204).json({ success: true, data: null });
});