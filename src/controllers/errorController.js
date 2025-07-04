const AppError = require('../utils/appError');

/**
 * Hàm xử lý lỗi E11000 từ MongoDB, biến nó thành lỗi 400 với thông báo thân thiện.
 */
const handleDuplicateFieldsDB = (err) => {
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Giá trị bị trùng lặp: ${value}. Vui lòng sử dụng một giá trị khác!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Dữ liệu đầu vào không hợp lệ. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // A) Lỗi có thể dự đoán được, gửi thông báo cho client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // B) Lỗi lập trình hoặc lỗi không xác định: không rò rỉ chi tiết
    // 1) Log lỗi
    console.error('ERROR 💥', err);
    // 2) Gửi thông báo chung chung
    return res.status(500).json({
        status: 'error',
        message: 'Đã có lỗi xảy ra từ hệ thống!'
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'production') {
        sendErrorDev(err, res);
    } else { // Giả sử mặc định là production
        let error = { ...err, message: err.message, name: err.name };

        // Xử lý các lỗi cụ thể của Mongoose để có thông báo tốt hơn
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        
        sendErrorProd(error, res);
    }
};