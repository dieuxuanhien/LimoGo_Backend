const mongoose = require('mongoose');
const app = require('./app'); // <-- IMPORT APP TỪ FILE app.js

// --- CONNECT TO MONGODB ---
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// --- START SERVER ---
const port = process.env.PORT || 3000;
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

// --- CRON JOBS (Giữ nguyên) ---
const Ticket = require('./models/ticket');
const Booking = require('./models/booking');


// ... (Khối setInterval cho TicketLock)
setInterval(async () => {
  try {
    const now = new Date();
    const result = await Ticket.updateMany(
      { status: 'locked', lockExpires: { $lt: now } },
      { $set: { status: 'available', user: null }, $unset: { lockExpires: "" } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[TicketLock] Released ${result.modifiedCount} expired seat locks.`);
    }
  } catch (err) {
    console.error('[TicketLock] Error releasing expired seat locks:', err);
  }
}, 60 * 1000);

// ... (Khối setInterval cho BookingExpiry đã refactor)
console.log('[CronJob] Booking expiry job scheduled to run every 5 minutes.');
setInterval(async () => {
  try {
    const now = new Date();
    const expiredBookings = await Booking.find({
      approvalStatus: 'pending_approval', 
      bookingExpiresAt: { $lt: now }
    });

    if (expiredBookings.length > 0) {
        const expiredBookingIds = expiredBookings.map(b => b._id);
        let ticketIdsToRelease = [];
        expiredBookings.forEach(b => ticketIdsToRelease.push(...b.tickets));

        await Ticket.updateMany(
          { _id: { $in: ticketIdsToRelease } },
          { $set: { status: 'available', user: null, booking: null }, $unset: { lockExpires: "" } }
        );
        
        await Booking.updateMany(
          { _id: { $in: expiredBookingIds } },
          { $set: { paymentStatus: 'expired' } }
        );

        console.log(`[BookingExpiry] Expired ${expiredBookings.length} pending bookings.`);
    }
  } catch (err) {
    console.error('[BookingExpiry] Error expiring bookings:', err);
  }
}, 5 * 60 * 1000);