const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController'); 



// --- Import Routers ---
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

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
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

// --- Static Files ---
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// --- 404 Error Handling ---
// Bất kỳ request nào không khớp với các định nghĩa ở trên sẽ bị bắt ở đây
app.all('*', (req, res, next) => {
    next(new AppError(`Không thể tìm thấy ${req.originalUrl} trên server này!`, 404));
});

// --- Global Error Handler ---
// Đây luôn là middleware cuối cùng
app.use(globalErrorHandler);

module.exports = app;