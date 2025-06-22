// src/controllers/ticketController.js
const Ticket = require('../models/ticket');

// Lấy các vé đã đặt của người dùng đang đăng nhập
exports.getMyBookedTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user._id, status: 'booked' })
            .populate({
                path: 'trip',
                select: 'departureTime arrivalTime',
                populate: {
                    path: 'route',
                    populate: [
                        { path: 'originStation', select: 'name city' },
                        { path: 'destinationStation', select: 'name city' }
                    ]
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};