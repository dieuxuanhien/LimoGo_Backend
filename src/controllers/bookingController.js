// src/controllers/bookingController.js
const Ticket = require('../models/ticket');
const Booking = require('../models/booking');
const Trip = require('../models/trip');
const mongoose = require('mongoose');

// API: POST /booking/lock - Khóa ghế
exports.lockSeat = async (req, res) => {
    const { ticketId } = req.body;
    try {
        const now = new Date();
        const ticket = await Ticket.findOneAndUpdate(
            { 
                _id: ticketId,
                $or: [
                    { status: 'available' },
                    { status: 'locked', lockExpires: { $lt: now } }
                ]
            },
            { 
                $set: { 
                    status: 'locked', 
                    user: req.user._id, 
                    lockExpires: new Date(now.getTime() + 10 * 60 * 1000) // Khóa trong 10 phút
                } 
            },
            { new: true }
        );

        if (!ticket) {
            return res.status(409).json({ success: false, message: 'Ghế này vừa được người khác giữ hoặc đã được đặt. Vui lòng thử lại.' });
        }
        res.status(200).json({ success: true, message: 'Giữ chỗ thành công trong 10 phút.', data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server khi giữ chỗ', error: err.message });
    }
};


// API: POST /booking/confirm - Xác nhận đặt vé
exports.confirmBooking = async (req, res) => {
    // 1. Lấy dữ liệu từ body
    const { ticketIds, paymentMethod } = req.body;
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 2. Tìm và xác thực các vé đã được khóa bởi người dùng
        const tickets = await Ticket.find({
            _id: { $in: ticketIds },
            user: req.user._id,
            status: 'locked'
        }).populate('trip').session(session);

        if (tickets.length !== ticketIds.length || tickets.length === 0) {
            throw new Error('Một hoặc nhiều vé không hợp lệ hoặc đã hết hạn giữ chỗ.');
        }

        // 3. Chuẩn bị dữ liệu chung cho đơn hàng
        const providerId = tickets[0].trip.provider;
        const totalPrice = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

        const bookingData = {
            user: req.user._id,
            tickets: ticketIds,
            totalPrice: totalPrice,
            provider: providerId,
            paymentMethod: paymentMethod,
            approvalStatus: 'pending_approval', 
            paymentStatus: 'pending',
        };
        
        // 4. Xử lý logic khác nhau cho từng phương thức thanh toán
        let successMessage = '';
        if (paymentMethod === 'cash') {
            // Với tiền mặt, cho nhà xe 1 giờ để duyệt
            bookingData.bookingExpiresAt = new Date(Date.now() + 60 * 60 * 1000); 
            successMessage = 'Yêu cầu đặt vé đã được gửi, vui lòng chờ nhà xe xác nhận.';
        } else if (paymentMethod === 'bank_transfer') {
            // Với chuyển khoản, cho người dùng 15 phút để thanh toán
            bookingData.bookingExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
            successMessage = 'Đơn hàng đã được tạo, hãy tiến hành thanh toán để hoàn tất.';
        }
        
        // 5. Tạo đơn hàng mới
        const [savedBooking] = await Booking.create([bookingData], { session });

        // 6. Cập nhật trạng thái vé
        await Ticket.updateMany(
            { _id: { $in: ticketIds } },
            { 
                $set: { 
                    status: 'pending_approval', // Chuyển sang chờ duyệt
                    booking: savedBooking._id
                },
                $unset: { lockExpires: "" }
            },
            { session }
        );
        
        await session.commitTransaction();
        res.status(201).json({ success: true, message: successMessage, data: savedBooking });

    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        session.endSession();
    }
};



// --- HÀM MỚI CHO NHÀ XE DUYỆT VÉ ---
exports.approveBooking = async (req, res) => {
    const { bookingId } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Tìm đơn hàng đang chờ duyệt của nhà xe
        const booking = await Booking.findOne({
            _id: bookingId,
            provider: req.provider._id, // Đảm bảo đúng nhà xe duyệt
            approvalStatus: 'pending_approval'
        }).session(session);

        if (!booking) {
            throw new Error('Đơn hàng không tồn tại, đã được xử lý hoặc không thuộc quyền quản lý của bạn.');
        }

        // 2. THAY ĐỔI: Chỉ cho phép duyệt các đơn hàng trả tiền mặt qua API này
        if (booking.paymentMethod !== 'cash') {
            throw new Error('API này chỉ dùng để duyệt các đơn hàng thanh toán tiền mặt (cash).');
        }

        // 3. THAY ĐỔI: Cập nhật trạng thái theo logic mới
        booking.approvalStatus = 'confirmed_by_provider'; // Đã được nhà xe duyệt
        booking.paymentStatus = 'pending'; // Trạng thái thanh toán vẫn là 'chờ' (sẽ được cập nhật thủ công sau)
        booking.bookingExpiresAt = undefined; // Bỏ đi hạn duyệt vì đã được duyệt
        await booking.save({ session });

        // 4. Cập nhật các vé liên quan thành đã đặt (booked)
        await Ticket.updateMany(
            { _id: { $in: booking.tickets } },
            { $set: { status: 'booked' } }
        ).session(session);

        await session.commitTransaction();
        res.status(200).json({ success: true, message: 'Đơn hàng đã được duyệt thành công.', data: booking });

    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        session.endSession();
    }
};


exports.getMyBookings = async (req, res) => {
    try {
        // 1. Logic Phân trang: Lấy giá trị từ query hoặc dùng giá trị mặc định
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const skip = (page - 1) * limit;

        // 2. Điều kiện lọc: Chỉ lấy các booking của user đang đăng nhập
        const filter = { user: req.user._id };

        // 3. Thực hiện 2 truy vấn song song: một để lấy dữ liệu, một để đếm tổng số
        // Định nghĩa các tùy chọn populate cho từng cấp
        const stationPopulateOptions = { 
            path: 'originStation destinationStation', 
            select: 'name city' 
        };

        const routePopulateOptions = { 
            path: 'route', 
            select: 'originStation destinationStation', 
            populate: stationPopulateOptions 
        };

        const tripPopulateOptions = { 
            path: 'trip', 
            select: 'departureTime arrivalTime route', 
            populate: routePopulateOptions 
        };

        const ticketsPopulateOptions = {
            path: 'tickets',
            select: 'seatNumber price trip',
            populate: tripPopulateOptions
        };

        const [ bookings, totalCount ] = await Promise.all([
                Booking.find(filter)
                    .populate(ticketsPopulateOptions)
                    .sort({ createAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Booking.countDocuments(filter)  
        ]);

        // 4. Trả về kết quả có cấu trúc phân trang
        res.status(200).json({
            success: true,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: bookings
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
};