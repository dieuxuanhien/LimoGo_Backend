// file: controllers/errorController.js

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Chỉ gửi lỗi có thể dự đoán được (operational) cho client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // Lỗi lập trình hoặc lỗi không xác định: không rò rỉ chi tiết
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Đã có lỗi xảy ra!'
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Tùy vào môi trường mà gửi thông tin lỗi khác nhau
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        // Có thể thêm các xử lý lỗi cụ thể ở đây (ví dụ: lỗi từ Mongoose)
        sendErrorProd(err, res);
    }
};