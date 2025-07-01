const Provider = require('../models/provider');
const Booking = require('../models/booking');
const Trip = require('../models/trip');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { filterObject } = require('../utils/helpers');



exports.getAllProviders = async (req, res, next) => {

    const filterBody = filterObject(req.query, 'name', 'email', 'phone', 'address', 'status', 'taxId');

        const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
        const limit = parseInt(req.query.limit) || 10; // Số lượng bản ghi mỗi trang, mặc định là 10
        const skip = (page - 1) * limit; // Số bản ghi cần bỏ qua

    const [ providers, totalCount ] = await Promise.all ([
        Provider.find(filterBody)
            .select('+mainUser') // Chọn trường mainUser để trả về
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo mới nhất
            .lean(), // Chuyển sang object thường để dễ dàng xử lý
        Provider.countDocuments(filterBody) // Đếm tổng số nhà xe phù hợp với filter  
    ]);
    
    if (!providers) {
        return next(new AppError('Không tìm thấy các nhà xe', 404));
    }

    res.status(200).json({
         success: true, 
         totalCount,
         totalPages: Math.ceil(totalCount / limit),
         currentPage: page,
         data: providers 
        });
}


exports.getProviderById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const provider = await Provider.findById(id).select('+mainUser');

    if (!provider) {
        return next(new AppError('Không tìm thấy nhà xe với ID này', 404));
    }

    res.status(200).json({ 
        success: true,
        data: provider 
    });
});


exports.createProvider = catchAsync(async (req, res, next) => {
    const filteredBody = filterObject(req.body, 'name', 'email', 'phone', 'address', 'taxId', 'mainUser');
    const newProvider = await Provider.create(filteredBody);

    res.status(201).json({
        success: true,
        message: 'Tạo nhà xe thành công!',
        data: newProvider
    });
});


exports.updateProvider = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const filteredBody = filterObject(req.body, 'name', 'email', 'phone', 'address', 'status', 'taxId');
    
    const provider = await Provider.findByIdAndUpdate(id, filteredBody, {
        new: true,
        runValidators: true
    });

    if (!provider) {
        return next(new AppError('Không tìm thấy nhà xe với ID này', 404));
    }

    res.status(200).json({ 
        success: true,
        message: 'Cập nhật nhà xe thành công!',
        data: provider 
    });
});


exports.deleteProvider = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const provider = await Provider.findByIdAndDelete(id);

    if (!provider) {
        return next(new AppError('Không tìm thấy nhà xe với ID này', 404));
    }
    
    res.status(200).json({
        success: true,
        message: 'Xóa nhà xe thành công.'
    });
});


exports.getProviderByMainUser = async (req, res) => {
    const { mainUser } = req.params;
    const provider = await Provider.findOne({ mainUser }).select('+mainUser');

    if (!provider) {
        return next(new AppError('Không tìm thấy nhà xe cho người dùng này', 404));
    }

    res.status(200).json({ 
        status: 'success',
        data: { provider } 
    });
}


exports.getProviderByCurrentUser = async (req, res) => {
    const userId = req.user._id;
    const provider = await Provider.findOne({ mainUser: userId }).select('+mainUser');
    
    if (!provider) {
        return next(new AppError('Không tìm thấy thông tin nhà xe của bạn', 404));
    }

    res.status(200).json({ 
        status: 'success',
        data: { provider } 
    });
}


exports.updateProviderByCurrentUser = async (req, res, next) => {
    const userId = req.user._id;
    const filteredBody = filterObject(req.body, 'name', 'phone', 'address', 'taxId');

    const provider = await Provider.findOneAndUpdate(
        { mainUser: userId },
        filteredBody,
        { new: true, runValidators: true }
    ).select('+mainUser');
    
    if (!provider) {
        return next(new AppError('Không tìm thấy thông tin nhà xe của bạn', 404));
    }

    res.status(200).json({ 
        status: 'success',
        data: { provider }
    });
};


exports.getDashboardStats = async (req, res) => {
    const providerId = req.provider._id;
    const period = req.query.period || 'today'; // Mặc định là 'today'

     // 1. Tính toán khoảng thời gian
    const now = new Date();
    let startDate, endDate;

    // Luôn set giờ về đầu và cuối ngày theo UTC để đảm bảo tính nhất quán
    switch (period) {
        case 'week':
            startDate = new Date(now);
            startDate.setUTCHours(0, 0, 0, 0);
            startDate.setDate(now.getDate() - now.getDay()); // Bắt đầu từ Chủ Nhật
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setUTCHours(23, 59, 59, 999);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setUTCHours(23, 59, 59, 999);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), 11, 31);
            endDate.setUTCHours(23, 59, 59, 999);
            break;
        case 'today':
        default:
            startDate = new Date();
            startDate.setUTCHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setUTCHours(23, 59, 59, 999);
            break;
        }
        
        // 2. Tạo các promise để thực thi song song
    const bookingStatsPromise = Booking.aggregate([
        {
            $match: {
                provider: new mongoose.Types.ObjectId(providerId),
                status: 'confirmed',
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalPrice" },
                ticketsSold: { $sum: { $size: "$tickets" } }
            }
        }
    ]);

    const tripsTodayPromise = Trip.countDocuments({
        provider: providerId,
        departureTime: { $gte: startDate, $lte: endDate }
    });

    const newBookingsPromise = Booking.countDocuments({
        provider: providerId,
        status: 'pending_approval',
        createdAt: { $gte: startDate, $lte: endDate }
    });

    // 3. Thực thi song song và chờ kết quả
    const [bookingStats, tripsToday, newBookings] = await Promise.all([
        bookingStatsPromise,
        tripsTodayPromise,
        newBookingsPromise
    ]);

    // 4. Tổng hợp kết quả
    const stats = {
        period,
        totalRevenue: bookingStats[0]?.totalRevenue || 0,
        ticketsSold: bookingStats[0]?.ticketsSold || 0,
        tripsToday: tripsToday || 0,
        newBookings: newBookings || 0
    };

        
res.status(200).json({ 
        status: 'success',
        data: { stats } 
    });
};  