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
app.use('/api/bookings', bookingRouter);  // Sửa từ booking thành bookings
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



// Check if admin build exists, if not show development message
const adminBuildPath = path.join(__dirname, '../admin/build');
const fs = require('fs');

if (fs.existsSync(adminBuildPath)) {
    // Serve static admin panel (after all API routes)
    app.use('/admin', express.static(adminBuildPath));
    
    // Serve static assets với đường dẫn đầy đủ
    app.use('/admin/static', express.static(path.join(adminBuildPath, 'static')));
    
    // Catch-all handler for React Router (SPA)
    app.get('/admin/*', (req, res) => {
        res.sendFile(path.join(adminBuildPath, 'index.html'));
    });
} else {
    // Admin not built yet, show development message
    app.get('/admin*', (req, res) => {
        res.send(`
            <html>
                <head>
                    <title>LimoGo Admin - Development</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 50px; background: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .title { color: #1976d2; margin-bottom: 20px; }
                        .code { background: #f0f0f0; padding: 15px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
                        .step { margin: 15px 0; padding: 10px; border-left: 4px solid #1976d2; background: #f8f9fa; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="title">🚀 LimoGo Admin Panel - Development Mode</h1>
                        <p>Trang admin chưa được build. Hãy thực hiện các bước sau:</p>
                        
                        <div class="step">
                            <h3>Bước 1: Cài đặt dependencies</h3>
                            <div class="code">
                                cd admin<br>
                                npm install
                            </div>
                        </div>
                        
                        <div class="step">
                            <h3>Bước 2: Chạy development mode</h3>
                            <div class="code">npm start</div>
                            <p>Sau đó truy cập: <a href="http://localhost:3001" target="_blank">http://localhost:3001</a></p>
                        </div>
                        
                        <div class="step">
                            <h3>Bước 3: Build cho production</h3>
                            <div class="code">npm run build</div>
                            <p>Sau đó refresh trang này để sử dụng admin panel.</p>
                        </div>
                        
                        <p><strong>API Backend:</strong> <a href="/api">/api</a> đang chạy bình thường.</p>
                    </div>
                </body>
            </html>
        `);
    });
}

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