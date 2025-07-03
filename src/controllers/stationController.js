const Station = require('../models/station');
const Route = require('../models/route'); // Import để kiểm tra sự phụ thuộc
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { filterObject } = require('../utils/helpers'); 


// Lấy danh sách các station với logic phân quyền
exports.getAllStations = catchAsync(async (req, res, next) => {
    // 1. Lấy các tham số phân trang từ query string, gán giá trị mặc định nếu không có
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Giữ nguyên logic lọc dữ liệu dựa trên vai trò 'provider'
    let filter = {};
    if (req.user.role === 'provider') {
        filter = {
            $or: [
                { type: 'main_station' },
                { ownerProvider: req.provider._id }
            ]
        };
    }

    // 3. Xây dựng câu truy vấn cơ bản mà không thực thi ngay
    let query = Station.find(filter)
        .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo mới nhất
        .skip(skip)
        .limit(limit)
        .lean(); // Dùng .lean() để tăng tốc các truy vấn chỉ đọc

    // 4. Áp dụng populate có điều kiện: chỉ không populate khi là admin
    if (req.user.role !== 'admin') {
        query = query.populate('ownerProvider', 'name');
    }

    // 5. Thực thi song song 2 câu lệnh: một để lấy dữ liệu, một để đếm tổng số
    const [stations, totalCount] = await Promise.all([
        query, // thực thi câu lệnh đã xây dựng ở trên
        Station.countDocuments(filter) // đếm tổng số document khớp với bộ lọc
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);

    // 6. Trả về response với cấu trúc dữ liệu phân trang
    res.status(200).json({
        success: true,
        pagination: {
            totalCount,
            totalPages,
            currentPage: page
        },
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

// Tạo station mới với logic phân quyền
exports.createStation = catchAsync(async (req, res, next) => {
    
    const filteredBody = filterObject(req.body, 'name', 'city', 'address', 'coordinates', 'type');

    // GIẢI THÍCH: Tự động gán quyền sở hữu nếu người tạo là Provider
    if (req.user.role === 'provider') {
        // Provider chỉ được tạo 'pickup_point' và sẽ là chủ sở hữu
        filteredBody.type = 'pickup_point';
        filteredBody.ownerProvider = req.provider._id;
    }

    const newStation = await Station.create(filteredBody);

    res.status(201).json({
        success: true,
        message: 'Tạo trạm/bến xe thành công!',
        data: newStation
    });
});

// Cập nhật station với kiểm tra quyền sở hữu
exports.updateStation = catchAsync(async (req, res, next) => {
    // Middleware checkStationOwnership đã tìm và xác thực quyền,
    // tài nguyên được gắn vào req.station.
    const station = req.station; 
    
    const filteredBody = filterObject(req.body, 'name', 'city', 'address', 'coordinates');
    
    // Cập nhật các trường được phép
    Object.assign(station, filteredBody);
    await station.save({ validateModifiedOnly: true });

    res.status(200).json({
        success: true,
        message: 'Cập nhật thành công!',
        data: station
    });
});

// Xóa station với kiểm tra quyền sở hữu và sự phụ thuộc
exports.deleteStation = catchAsync(async (req, res, next) => {
    // Middleware đã xác thực quyền, req.station đã có sẵn.
    const stationId = req.station._id;

    // Kiểm tra sự phụ thuộc
    const existingRoute = await Route.findOne({ $or: [{ originStation: stationId }, { destinationStation: stationId }] });
    if (existingRoute) {
        return next(new AppError('Không thể xóa bến xe này vì nó đang được sử dụng trong một tuyến đường. Vui lòng xóa tuyến đường liên quan trước.', 400));
    }

    await Station.findByIdAndDelete(stationId);

    res.status(200).json({ success: true, message: 'Xóa trạm/bến xe thành công.' });
});