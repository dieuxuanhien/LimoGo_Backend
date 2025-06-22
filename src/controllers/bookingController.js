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
    const { ticketIds } = req.body;
    if (!ticketIds || ticketIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Cần có ít nhất một ticketId.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const tickets = await Ticket.find({
            _id: { $in: ticketIds },
            user: req.user._id,
            status: 'locked'
        }).populate('trip').session(session);

        if (tickets.length !== ticketIds.length) {
            throw new Error('Một hoặc nhiều vé không hợp lệ hoặc đã hết hạn giữ chỗ.');
        }

        // Lấy provider ID từ chuyến đi đầu tiên (giả định tất cả vé trong 1 booking thuộc 1 trip)
        const providerId = tickets[0].trip.provider;
        const totalPrice = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

        const newBooking = new Booking({
            user: req.user._id,
            tickets: ticketIds,
            totalPrice: totalPrice,
            provider: providerId,
            status: 'pending_approval',
            bookingExpiresAt: new Date(Date.now() + 30 * 60 * 1000) // Hạn 30 phút cho nhà xe duyệt
        });
        const savedBooking = await newBooking.save({ session });

        await Ticket.updateMany(
            { _id: { $in: ticketIds } },
            { 
                $set: { 
                    status: 'pending_approval', // Chuyển sang chờ duyệt
                    booking: savedBooking._id
                },
                $unset: { lockExpires: "" }
            }
        ).session(session);
        
        await session.commitTransaction();
        res.status(201).json({ success: true, message: 'Yêu cầu đặt vé đã được gửi, vui lòng chờ nhà xe xác nhận.', data: savedBooking });

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
        const booking = await Booking.findOne({
            _id: bookingId,
            provider: req.provider._id, // Đảm bảo đúng nhà xe duyệt
            status: 'pending_approval'
        }).session(session);

        if (!booking) {
            throw new Error('Đơn hàng không tồn tại, đã được duyệt hoặc không thuộc quyền quản lý của bạn.');
        }

        // Cập nhật đơn hàng thành đã xác nhận
        booking.status = 'confirmed';
        booking.paymentStatus = 'pending'; // Sẵn sàng cho thanh toán
        booking.bookingExpiresAt = undefined; // Bỏ đi hạn duyệt
        await booking.save({ session });

        // Cập nhật các vé liên quan thành đã đặt
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