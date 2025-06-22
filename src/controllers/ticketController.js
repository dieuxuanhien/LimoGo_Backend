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

const Ticket = require('../models/ticket');

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate({
        path: 'trip',
        populate: [
          { path: 'route' },
          { path: 'vehicle' },
          { path: 'driver' }
        ]
      })
      .populate('user');

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

