const Route = require('../models/route');
const Trip = require('../models/trip'); // Import để kiểm tra sự phụ thuộc
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { filterObject } = require('../utils/helpers'); 

// Lấy danh sách route với logic phân quyền
exports.getAllRoutes = catchAsync(async (req, res, next) => {
    let filter = {};

    // GIẢI THÍCH: Provider thấy các tuyến chung của hệ thống VÀ các tuyến riêng của họ.
    if (req.user.role === 'provider') {
        filter = {
            $or: [
                { ownerProvider: null }, // Tuyến của hệ thống
                { ownerProvider: req.provider._id } // Tuyến của riêng họ
            ]
        };
    }
    // Admin thấy tất cả.

    const routes = await Route.find(filter)
        .select('originStation destinationStation ownerProvider estimatedDurationMin distanceKm')
        .populate({ path: 'originStation', select: 'name city type' })
        .populate({ path: 'destinationStation', select: 'name city type' })
        .populate({ path: 'ownerProvider', select: 'name' });

    res.status(200).json({
        success: true,
        totalCount: routes.length,
        data: routes
    });
});

// Lấy chi tiết một route với kiểm tra quyền
exports.getRouteById = catchAsync(async (req, res, next) => {
    const route = await Route.findById(req.params.id)
        .populate('originStation destinationStation');

    if (!route) {
        return next(new AppError('Không tìm thấy tuyến đường với ID này', 404));
    }

    // GIẢI THÍCH: Nếu route là của riêng một provider, chỉ provider đó hoặc admin mới được xem.
    if (req.user.role === 'provider' && route.ownerProvider && String(route.ownerProvider) !== String(req.provider._id)) {
        return next(new AppError('Bạn không có quyền xem tuyến đường này.', 403));
    }

    res.status(200).json({ success: true, data: route });
});


// Tạo route với logic phân quyền
exports.createRoute = catchAsync(async (req, res, next) => {
    const { originStation, destinationStation, distanceKm, estimatedDurationMin } = req.body;
    const routeData = { originStation, destinationStation, distanceKm, estimatedDurationMin };

    // GIẢI THÍCH: Custom Validator đã đảm bảo các station hợp lệ.
    // Controller chỉ việc gán chủ sở hữu cho route mới.
    if (req.user.role === 'provider') {
        routeData.ownerProvider = req.provider._id;
    }
    // Nếu là Admin, ownerProvider sẽ là null -> tuyến đường hệ thống

    const newRoute = await Route.create(routeData);
    res.status(201).json({
        success: true,
        message: 'Tạo tuyến đường thành công!',
        data: newRoute
    });
});

// Cập nhật route với kiểm tra quyền
exports.updateRoute = catchAsync(async (req, res, next) => {
    // Middleware checkRouteOwnership đã tìm, xác thực quyền,
    // và gắn tài nguyên vào req.route.
    const allowedFields = [ 'distanceKm', 'estimatedDurationMin'];

    const filterBody = filterObject(req.body, ...allowedFields);

    // Provider không được phép thay đổi chủ sở hữu của route
    if (req.user.role === 'provider' && req.body.ownerProvider) {
        return next(new AppError('Bạn không có quyền thay đổi chủ sở hữu của tuyến đường.', 400));
    }

    Object.assign(req.route, filterBody);
    await req.route.save({ validateModifiedOnly: true });

    res.status(200).json({ success: true, data: req.route });
});


// Xóa route với kiểm tra quyền và sự phụ thuộc
exports.deleteRoute = catchAsync(async (req, res, next) => {
    // Middleware đã xác thực quyền, req.route đã có sẵn.
    const routeId = req.route._id;

    // Kiểm tra sự phụ thuộc
    const activeTrip = await Trip.findOne({ route: routeId });
    if (activeTrip) {
        return next(new AppError('Không thể xóa tuyến đường này vì nó đang được sử dụng trong một chuyến đi.', 400));
    }

    await Route.findByIdAndDelete(routeId);

    res.status(200).json({ success: true, message: 'Xóa tuyến đường thành công.' });
});