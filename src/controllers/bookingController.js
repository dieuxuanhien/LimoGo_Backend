// src/controllers/bookingController.js
const Ticket = require('../models/ticket');
const Booking = require('../models/booking');
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const tickets = await Ticket.find({
            _id: { $in: ticketIds },
            user: req.user._id,
            status: 'locked'
        }).session(session);

        if (tickets.length !== ticketIds.length || tickets.length === 0) {
            throw new Error('Một hoặc nhiều vé không hợp lệ hoặc đã hết hạn giữ chỗ.');
        }

        const totalPrice = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

        const newBooking = new Booking({
            user: req.user._id,
            tickets: ticketIds,
            totalPrice: totalPrice,
            bookingExpiresAt: new Date(Date.now() + 30 * 60 * 1000) // Hạn thanh toán 30 phút
        });
        const savedBooking = await newBooking.save({ session });

        await Ticket.updateMany(
            { _id: { $in: ticketIds } },
            { 
                $set: { 
                    status: 'booked', 
                    booking: savedBooking._id
                },
                $unset: { lockExpires: "" }
            }
        ).session(session);
        
        await session.commitTransaction();
        res.status(201).json({ success: true, message: 'Đặt vé thành công! Vui lòng thanh toán trong 30 phút.', data: savedBooking });

    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        session.endSession();
    }
};