// src/controllers/ticketController.js
const Ticket = require('../models/ticket');

// Lấy các vé đã đặt của người dùng đang đăng nhập
exports.getMyBookedTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user.id, status: 'booked' })
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
// Lấy vé đã đặt hoặc chờ duyệt
// Lấy vé đã đặt hoặc chờ duyệt
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id, status: { $in: ['booked', 'pending_approval'] } })
      .populate({
        path: 'trip',
        select: 'departureTime route', // Chỉ lấy thời gian đi và thông tin tuyến
        populate: {
          path: 'route',
          select: 'originStation destinationStation', // Chỉ lấy bến đi và bến đến
          populate: [
            { path: 'originStation', select: 'name city' },
            { path: 'destinationStation', select: 'name city' }
          ]
        }
      })
      .select('seatNumber status accessId trip') // Chọn các trường cần thiết từ Ticket
      .sort({ createdAt: -1 })
      .lean(); // Dùng lean() để tăng hiệu suất và dễ chỉnh sửa

    // Xử lý để chỉ hiển thị accessId cho vé đã 'booked'
    tickets.forEach(ticket => {
      if (ticket.status !== 'booked') {
        ticket.accessId = undefined; // Ẩn accessId nếu vé không phải đã đặt
      }
    });

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('trip').populate('user');
    res.status(200).json(tickets);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate({
        path: 'trip',
        populate: [
          { path: 'route' },
          { path: 'vehicle' },
          { path: 'driver' }
        ]
      })
      .populate('user');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};



exports.createTicket = async (req, res) => {
  try {
    const ticket = await Ticket.create(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndRemove(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



exports.getTicketByUserId = async (req, res) => {
  const { userId } = req.params.userId;

  try {
    const tickets = await Ticket.find({ user: userId })
    .populate({
        path: 'trip',
        populate: [
          { path: 'route' },
          { path: 'vehicle' },
          { path: 'driver' }
        ]
      })
      .populate('user');

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'No tickets found for this user' });
    }
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate({
        path: 'trip_id',
        populate: [
          { path: 'route' },
          { path: 'vehicle' },
          { path: 'driver' }
        ]
      })
      .populate('user_id');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Only the user who booked or admin can cancel
    if (
      req.user.role !== 'admin' &&
      (!ticket.user_id || String(ticket.user_id._id) !== String(req.user._id))
    ) {
      return res.status(403).json({ success: false, message: 'You are not allowed to cancel this ticket' });
    }

    if (ticket.status !== 'booked') {
      return res.status(400).json({ success: false, message: 'Only booked tickets can be cancelled' });
    }

    // Set ticket to available, clear user and booking info
    ticket.status = 'available';
    ticket.user_id = undefined;
    ticket.bookingDate = undefined;
    ticket.paymentStatus = 'pending';
    await ticket.save();

    res.status(200).json({ success: true, message: 'Ticket cancelled successfully', data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// === ADMIN MANAGEMENT FUNCTIONS ===

exports.getAllTicketsAdmin = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    let filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.user) filter.user = req.query.user;
    if (req.query.trip) filter.trip = req.query.trip;

    const [tickets, totalCount] = await Promise.all([
      Ticket.find(filter)
        .populate({
          path: 'trip',
          populate: [
            { 
              path: 'route',
              populate: {
                path: 'originStation destinationStation',
                select: 'name city'
              }
            },
            { path: 'vehicle', select: 'type licensePlate' },
            { path: 'driver', select: 'name' },
            { path: 'provider', select: 'name' }
          ]
        })
        .populate('user', 'name email phoneNumber')
        .populate('booking')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

exports.getTicketByIdAdmin = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate({
        path: 'trip',
        populate: [
          { 
            path: 'route',
            populate: {
              path: 'originStation destinationStation',
              select: 'name city address'
            }
          },
          { path: 'vehicle', select: 'type licensePlate capacity' },
          { path: 'driver', select: 'name phoneNumber' },
          { path: 'provider', select: 'name phoneNumber email' }
        ]
      })
      .populate('user', 'name email phoneNumber')
      .populate('booking');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vé.' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

exports.updateTicketAdmin = async (req, res) => {
  try {
    const { status, user, seatNumber, price } = req.body;
    const updateData = {};
    
    if (status) updateData.status = status;
    if (user) updateData.user = user;
    if (seatNumber) updateData.seatNumber = seatNumber;
    if (price) updateData.price = price;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('trip user');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vé.' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Cập nhật vé thành công.',
      data: ticket 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

exports.deleteTicketAdmin = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vé.' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Xóa vé thành công.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

exports.createTicketAdmin = async (req, res) => {
  try {
    const ticket = await Ticket.create(req.body);
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('trip user');

    res.status(201).json({ 
      success: true, 
      message: 'Tạo vé thành công.',
      data: populatedTicket 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

