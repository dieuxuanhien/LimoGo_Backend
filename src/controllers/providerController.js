const Provider = require('../models/provider');
const Booking = require('../models/booking');
const Trip = require('../models/trip');
const mongoose = require('mongoose');



/*
 name: { type: String, required: true }, // Name of the provider
    email : { type: String, required: true, unique: true }, // Email of the provider
    phone: { type: String, required: true }, // Phone number of the provider
    address: { type: String, required: true }, // Address of the provider
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' }, // Status of the provider
    taxId: { type: String, required: false }, // Tax ID of the provider
    mainUser : { type: Schema.Types.ObjectId, ref: 'User', required: true}
*/

exports.getAllProviders = async (req, res) => {
    let filter = {};
    if (req.query.name) filter.name = req.query.name;
    if (req.query.email) filter.email = req.query.email;
    if (req.query.phone) filter.phone = req.query.phone;
    if (req.query.address) filter.address = req.query.address;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.taxId) filter.taxId = req.query.taxId;
    if (req.query.mainUser) filter.mainUser = req.query.mainUser;

    try {
        const providers = await Provider.find(filter).select('+mainUser');
        if (!providers) {
            return res.status(404).json({ success: false, message: 'Providers not found' });
        }
        res.status(200).json({ success: true, data: providers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

}


exports.getProviderById = async (req, res) => {
    const { id } = req.params;

    try {
        const provider = await Provider.findById(id).select('+mainUser');
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }
        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

    
}


exports.createProvider = async (req, res) => {
    const { name, email, phone, address, status, taxId, mainUser } = req.body;

    try {
        const provider = await Provider.create({ name, email, phone, address, status, taxId, mainUser });
        res.status(201).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

}


exports.updateProvider = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, status, taxId, mainUser } = req.body;

    try {
        const provider = await Provider.findByIdAndUpdate(id, { name, email, phone, address, status, taxId, mainUser }, { new: true, runValidators: true });
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }
        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    
}


exports.deleteProvider = async (req, res) => {
    const { id } = req.params;

    try {
        const provider = await Provider.findByIdAndDelete(id);
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }
        res.status(200).json({ success: true, message: 'Provider deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    
}


exports.getProviderByMainUser = async (req, res) => {
    const { mainUser } = req.params;

    try {
        const provider = await Provider.findOne({ mainUser }).select('+mainUser');
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }
        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    
}


exports.getProviderByCurrentUser = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming user ID is available in req.user
        const provider = await Provider.findOne({ mainUser: userId }).select('+mainUser');
        
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }
        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.updateProviderByCurrentUser = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming user ID is available in req.user
        const provider = await Provider.findOneAndUpdate(
            { mainUser: userId },
            req.body,
            { new: true, runValidators: true }
        ).select('+mainUser');
        
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }
        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


exports.getDashboardStats = async (req, res) => {
    try {
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

        res.status(200).json({ success: true, data: stats });

    } catch (err) {
        console.error("Error in getDashboardStats:", err);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy dữ liệu thống kê.', error: err.message });
    }
};