const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const app = express();
const path = require('path');
const authRouter = require('./routers/authRouter');
const userRouter = require('./routers/userRouter');
const driverRouter = require('./routers/driverRouter');
const routeRouter = require('./routers/routeRouter');
const reviewRouter = require('./routers/reviewRouter');
const vehicleRouter = require('./routers/vehicleRouter');
const tripRouter = require('./routers/tripRouter');
const issueRouter = require('./routers/issueRouter');
const ticketRouter = require('./routers/ticketRouter');
const stationRouter = require('./routers/stationRouter');
const providerRouter = require('./routers/providerRouter');
const { ensureRole } = require('./middlewares/identification');
dotenv.config();

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

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/driver', driverRouter);
app.use('/route', routeRouter);
app.use('/review', reviewRouter);
app.use('/vehicle', vehicleRouter);
app.use('/trip', tripRouter);
app.use('/issue', issueRouter);
app.use('/ticket', ticketRouter);
app.use('/station', stationRouter);
app.use('/provider', providerRouter);
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
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

