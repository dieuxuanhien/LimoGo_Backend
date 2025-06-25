const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const app = express();
const path = require('path');
const authRouter = require('./routers/authRouter');
const bookingRouter = require('./routers/bookingRouter');
const driverRouter = require('./routers/driverRouter');
const issueRouter = require('./routers/issueRouter');
const providerRouter = require('./routers/providerRouter');
const reviewRouter = require('./routers/reviewRouter');
const routeRouter = require('./routers/routeRouter');
const stationRouter = require('./routers/stationRouter');
const ticketRouter = require('./routers/ticketRouter');
const tripRouter = require('./routers/tripRouter');
const userRouter = require('./routers/userRouter');
const vehicleRouter = require('./routers/vehicleRouter');

const AppError = require('./utils/appError'); 



app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

app.use('/api/auth', authRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/drivers', driverRouter);
app.use('/api/issues', issueRouter);
app.use('/api/providers', providerRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/routes', routeRouter);
app.use('/api/stations', stationRouter);
app.use('/api/tickets', ticketRouter);
app.use('/api/trips', tripRouter);
app.use('/api/users', userRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Xử lý các route không tồn tại
app.all('*', (req, res) => {
    res.status(404).send('Route not found')
})

// MIDDLEWARE XỬ LÝ LỖI TOÀN CỤC (THAY THẾ HOẶC THÊM MỚI)
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
});



app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});


const Ticket = require('./models/ticket');
setInterval(async () => {
  try {
    const now = new Date();
    const result = await Ticket.updateMany(
      { status: 'locked', lockExpiresAt: { $lt: now } },
      { $set: { status: 'available', user: null, lockExpiresAt: null } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[TicketLock] Released ${result.modifiedCount} expired seat locks.`);
    }
  } catch (err) {
    console.error('[TicketLock] Error releasing expired seat locks:', err);
  }
}, 60 * 1000); // every 60 seconds


const Booking = require('./models/booking');
setInterval(async () => {
  try {
    const now = new Date();
    const expiredBookings = await Booking.find({
      status: 'pending_approval',
      bookingExpiresAt: { $lt: now }
    });

    if (expiredBookings.length > 0) {
        let ticketIdsToRelease = [];
        expiredBookings.forEach(b => ticketIdsToRelease.push(...b.tickets));

        // Trả các vé về trạng thái 'available'
        await Ticket.updateMany(
          { _id: { $in: ticketIdsToRelease } },
          { $set: { status: 'available', user: null, booking: null }, $unset: { lockExpires: "" } }
        );

        // Cập nhật trạng thái các đơn hàng thành 'expired'
        await Booking.updateMany(
          { _id: { $in: expiredBookings.map(b => b._id) } },
          { $set: { status: 'expired' } }
        );

        console.log(`[BookingExpiry] Expired ${expiredBookings.length} pending bookings.`);
    }
  } catch (err) {
    console.error('[BookingExpiry] Error expiring bookings:', err);
  }
}, 5 * 60 * 1000); // Chạy mỗi 5 phút
