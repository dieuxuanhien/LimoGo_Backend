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


exports.getTicketByTripId = async (req, res) => {
  const { tripId } = req.params;

  try {
    const tickets = await Ticket.find({ trip: tripId })
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
      return res.status(404).json({ success: false, message: 'No tickets found for this trip' });
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

// Book a ticket (seat lock for payment)
exports.bookTicket = async (req, res) => {
  try {
    const { trip, seatNumber } = req.body;
    if (!trip || !seatNumber) {
      return res.status(400).json({ success: false, message: 'Trip and seatNumber are required' });
    }
    // Check if seat is already booked or locked
    const existing = await Ticket.findOne({ trip, seatNumber, status: { $in: ['locked', 'booked'] } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Seat is already locked or booked' });
    }
    // Create a locked ticket (seat lock)
    const ticket = await Ticket.create({
      trip,
      seatNumber,
      user: req.user._id,
      status: 'locked',
      lockExpiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min lock
    });
    res.status(201).json({ success: true, message: 'Seat locked. Please complete payment to confirm.', data: { ticketId: ticket._id, lockExpiresAt: ticket.lockExpiresAt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm ticket after payment
exports.confirmTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (ticket.status !== 'locked') {
      return res.status(400).json({ success: false, message: 'Ticket is not in locked state' });
    }
    if (ticket.lockExpiresAt && ticket.lockExpiresAt < new Date()) {
      ticket.status = 'available';
      ticket.user = undefined;
      ticket.lockExpiresAt = undefined;
      await ticket.save();
      return res.status(410).json({ success: false, message: 'Seat lock expired' });
    }
    // Here, you would check payment status (not implemented)
    ticket.status = 'booked';
    ticket.lockExpiresAt = undefined;
    ticket.bookingDate = new Date();
    await ticket.save();
    res.status(200).json({ success: true, message: 'Ticket booked successfully', data: { ticketId: ticket._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


