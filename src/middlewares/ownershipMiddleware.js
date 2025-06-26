const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// --- Import các Model cần thiết ---
const Driver = require('../models/driver');
const Vehicle = require('../models/vehicle');
const Station = require('../models/station');
const Route = require('../models/route');

// --- HÀM CŨ: checkDriverOwnership (không đổi) ---
exports.checkDriverOwnership = catchAsync(async (req, res, next) => {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
        return next(new AppError('Không tìm thấy tài xế.', 404));
    }

    if (req.user.role === 'provider' && String(driver.provider) !== String(req.provider._id)) {
        return next(new AppError('Bạn không có quyền truy cập tài nguyên này.', 403));
    }

    req.driver = driver; // Gắn tài nguyên vào request
    next();
});

// --- HÀM CŨ: checkVehicleOwnership (không đổi) ---
exports.checkVehicleOwnership = catchAsync(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Không tìm thấy xe này.', 404));
    }

    if (req.user.role === 'provider' && String(vehicle.provider) !== String(req.provider._id)) {
        return next(new AppError('Bạn không có quyền truy cập vào tài nguyên này.', 403));
    }
    
    req.vehicle = vehicle; // Gắn tài nguyên vào request
    next();
});

// --- HÀM MỚI: checkStationOwnership ---
exports.checkStationOwnership = catchAsync(async (req, res, next) => {
    const station = await Station.findById(req.params.id);

    if (!station) {
        return next(new AppError('Không tìm thấy trạm/bến xe.', 404));
    }

    // GIẢI THÍCH: Middleware này dùng cho các hành động GHI (update/delete).
    // Provider chỉ được phép thực hiện trên các 'pickup_point' mà họ sở hữu.
    if (req.user.role === 'provider') {
        if (station.type !== 'pickup_point' || !station.ownerProvider || String(station.ownerProvider) !== String(req.provider._id)) {
            return next(new AppError('Bạn không có quyền chỉnh sửa tài nguyên này.', 403));
        }
    }
    // Admin có toàn quyền.

    req.station = station; // Gắn tài nguyên vào request để controller dùng lại
    next();
});

// --- HÀM MỚI: checkRouteOwnership ---
exports.checkRouteOwnership = catchAsync(async (req, res, next) => {
    const route = await Route.findById(req.params.id);

    if (!route) {
        return next(new AppError('Không tìm thấy tuyến đường.', 404));
    }

    // GIẢI THÍCH: Provider chỉ được phép GHI (update/delete) trên các route mà họ sở hữu.
    // Họ không được sửa các route của hệ thống (ownerProvider == null).
    if (req.user.role === 'provider') {
        if (!route.ownerProvider || String(route.ownerProvider) !== String(req.provider._id)) {
             return next(new AppError('Bạn không có quyền chỉnh sửa tài nguyên này.', 403));
        }
    }
    // Admin có toàn quyền.

    req.route = route; // Gắn tài nguyên vào request để controller dùng lại
    next();
});