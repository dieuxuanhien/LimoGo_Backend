const Station = require('../models/station');
const Itinerary = require('../models/itinerary');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { filterObject } = require('../utils/helpers'); 
const user = require('../models/user');


// Lấy danh sách các station với logic phân quyền
exports.getAllStations = catchAsync(async (req, res, next) => {
    let filter = {};
    const { role } = req.user;

    // Provider thấy bến xe chính, điểm chung, và điểm riêng của họ
    if (role === 'provider') {
        filter = {
            $or: [
                { type: 'main_station' },
                { type: 'shared_point' },
                { ownerProvider: req.provider._id }
            ]
        };
    }
    // Admin thấy tất cả (filter rỗng)
    
    // Logic phân trang giữ nguyên
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [stations, totalCount] = await Promise.all([
        Station.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
        Station.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
        success: true,
        pagination: { totalCount, totalPages, currentPage: page },
        data: stations
    });
});


// Lấy chi tiết một station
exports.getStationById = catchAsync(async (req, res, next) => {
    const station = await Station.findById(req.params.id);
    if (!station) {
        return next(new AppError('Không tìm thấy trạm/bến xe với ID này', 404));
    }
    res.status(200).json({ success: true, data: station });
});



// Tạo station mới với logic 3 trạng thái
exports.createStation = catchAsync(async (req, res, next) => {

    if (user.role === 'admin'){
        const user = await user.create(req.body);
        return res.status(201).json({ success: true, data: user });
    }

    const { name, address, city, isPrivate } = req.body;

    // Trường hợp 1: Provider tạo điểm đón riêng
    if (req.user.role === 'provider' && isPrivate) {
        const stationData = { name, address, city, type: 'private_point', ownerProvider: req.provider._id };
        const newStation = await Station.create(stationData);
        return res.status(201).json({ success: true, data: newStation });
    }

    // Trường hợp 2: Tạo điểm đón chung (Admin hoặc Provider)
    // Phải kiểm tra trùng lặp trước
    const existingSharedStation = await Station.findOne({
        name: { $regex: `^${name}$`, $options: 'i' }, // Tìm chính xác tên không phân biệt hoa thường
        city,
        type: { $in: ['shared_point', 'main_station'] }
    });

    if (existingSharedStation) {
        return next(new AppError('Một điểm đón/bến xe chung với tên này tại cùng thành phố đã tồn tại.', 409));
    }

    const stationData = {
        name, address, city,
        type: req.user.role === 'admin' ? req.body.type || 'shared_point' : 'shared_point', // Admin có thể chọn type, Provider thì mặc định là shared
        ownerProvider: null
    };
    const newStation = await Station.create(stationData);
    res.status(201).json({ success: true, data: newStation });
});


// Cập nhật station với quy tắc phân quyền nghiêm ngặt
exports.updateStation = catchAsync(async (req, res, next) => {


    if (user.role === 'admin'){
        const user = await user.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: user });
    }
    
    const stationId = req.params.id;
    const role = req.user.userRole;

    const stationToUpdate = await Station.findById(stationId);
    if (!stationToUpdate) {
        return next(new AppError('Không tìm thấy điểm đón/trả.', 404));
    }

    // Áp dụng quy tắc phân quyền
    if (stationToUpdate.type === 'main_station' || stationToUpdate.type === 'shared_point') {
        if (role !== 'admin') {
            return next(new AppError('Bạn không có quyền chỉnh sửa tài nguyên chung của hệ thống.', 403));
        }
    } else if (stationToUpdate.type === 'private_point') {
        if (role === 'provider' && String(stationToUpdate.ownerProvider) !== String(req.provider._id)) {
            return next(new AppError('Bạn không có quyền chỉnh sửa điểm đón riêng của nhà xe khác.', 403));
        }
    }

    // Cập nhật các trường được phép
    const allowedUpdates = ['name', 'address', 'city', 'coordinates'];
    const updateData = {};
    Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) updateData[key] = req.body[key];
    });

    if (Object.keys(updateData).length === 0) {
        return next(new AppError('Không có dữ liệu hợp lệ để cập nhật.', 400));
    }

    const updatedStation = await Station.findByIdAndUpdate(stationId, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updatedStation });
});


// Xóa station với kiểm tra phụ thuộc vào Itinerary
exports.deleteStation = catchAsync(async (req, res, next) => {
    const stationId = req.params.id;
    const stationToDelete = await Station.findById(stationId);

    if (!stationToDelete) return next(new AppError('Không tìm thấy điểm đón/trả.', 404));
    
    // Provider chỉ được xóa điểm đón riêng của mình (Admin có quyền ghi đè)
    if (req.user.role === 'provider' && String(stationToDelete.ownerProvider) !== String(req.provider._id)) {
        return next(new AppError('Bạn không có quyền xóa tài nguyên này.', 403));
    }
     // Provider cũng không được xóa điểm đón chung hoặc bến xe chính
    if (req.user.role === 'provider' && (stationToDelete.type === 'shared_point' || stationToDelete.type === 'main_station')) {
        return next(new AppError('Bạn không có quyền xóa tài nguyên chung của hệ thống.', 403));
    }

    // Kiểm tra sự phụ thuộc trong các hành trình
    const activeItinerary = await Itinerary.findOne({ 'stops.station': stationId });
    if (activeItinerary) {
        return next(new AppError('Không thể xóa vì đang có Hành trình sử dụng điểm đón/trả này.', 400));
    }

    await Station.findByIdAndDelete(stationId);
    res.status(204).json({ success: true, data: null });
});