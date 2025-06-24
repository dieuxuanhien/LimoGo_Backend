const Driver = require('../models/driver');
const Vehicle = require('../models/vehicle');
const mongoose = require('mongoose');


exports.checkDriverOwnership = async (req, res, next) => {
    try {
        const { id } = req.params;
        const driver = await Driver.findById(id);

        // 1. Kiểm tra tài xế có tồn tại không
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài xế.' });
        }

        // 2. Nếu là provider, kiểm tra quyền sở hữu
        // Middleware isProvider đã chạy trước đó và cung cấp req.provider
        if (req.user.role === 'provider' && String(driver.provider) !== String(req.provider._id)) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập tài nguyên này.' });
        }

        // 3. Gắn driver vào request để controller có thể sử dụng mà không cần tìm lại
        req.driver = driver;
        next(); // Tất cả hợp lệ, chuyển sang middleware/controller tiếp theo

    } catch (error) {
        // Xử lý trường hợp ID không hợp lệ (ví dụ: ID quá ngắn hoặc sai định dạng)
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: `ID tài xế không hợp lệ: ${req.params.id}` });
        }
        // Các lỗi server khác
        res.status(500).json({ success: false, message: 'Lỗi máy chủ trong quá trình xác thực quyền sở hữu.', error: error.message });
    }
};


exports.checkVehicleOwnership = async (req, res, next) => {
    try {
        const vehicleId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
            return res.status(400).json({ success: false, message: 'ID xe không hợp lệ.' });
        }

        const vehicle = await Vehicle.findById(vehicleId);

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy xe này.' });
        }

        // Nếu là admin, luôn có quyền truy cập
        if (req.user.role === 'admin') {
            req.vehicle = vehicle; // Gắn vehicle vào request để controller dùng lại
            return next();
        }

        // Nếu là provider, kiểm tra quyền sở hữu
        if (req.user.role === 'provider') {
            if (String(vehicle.provider) !== String(req.provider._id)) {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập vào tài nguyên này.' });
            }
        }
        
        req.vehicle = vehicle; // Gắn vehicle vào request để controller dùng lại
        next();

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server khi kiểm tra quyền sở hữu.', error: err.message });
    }
};