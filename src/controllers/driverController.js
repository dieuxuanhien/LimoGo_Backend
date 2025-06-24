const Driver = require('../models/driver');

// --- Các hàm không thay đổi logic, chỉ thay đổi cách export ---

const getAllDrivers = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'provider') {
            filter.provider = req.provider._id;
        } else if (req.user.role === 'admin' && req.query.provider) {
            filter.provider = req.query.provider;
        }

        if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };
        if (req.query.currentStation) filter.currentStation = req.query.currentStation;
        if (req.query.age) filter.age = req.query.age;
        if (req.query.status) filter.status = req.query.status;

        const drivers = await Driver.find(filter)
            .populate('currentStation', 'name city')
            .populate('provider', 'name');

        res.status(200).json({ success: true, count: drivers.length, data: drivers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách tài xế.', error: error.message });
    }
};

const createDriver = async (req, res) => {
    try {
        const { name, currentStation, age, status } = req.body;
        let providerId;

        if (req.user.role === 'provider') {
            providerId = req.provider._id;
        } else if (req.user.role === 'admin') {
            providerId = req.body.provider;
        }

        const photo = req.file ? req.file.path : null;
        const driverData = { name, currentStation, provider: providerId, age, photo, status: status || 'available' };
        const driver = await Driver.create(driverData);

        res.status(201).json({ success: true, message: 'Tạo tài xế thành công.', data: driver });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo tài xế.', error: error.message });
    }
};


// --- Các hàm được TỐI ƯU HÓA nhờ middleware ---

/**
 * Lấy chi tiết một tài xế.
 * Middleware `checkDriverOwnership` đã tìm và xác thực tài xế.
 * Chúng ta chỉ việc trả về `req.driver`.
 */
const getDriverById = async (req, res) => {
    // Không cần try...catch hay tìm kiếm nữa. Middleware đã xử lý hết.
    // Chúng ta có thể populate thêm dữ liệu nếu muốn trước khi gửi về
    const driver = await req.driver.populate([
        { path: 'currentStation', select: 'name city' },
        { path: 'provider', select: 'name' }
    ]);
    res.status(200).json({ success: true, data: driver });
};

/**
 * Cập nhật thông tin tài xế.
 * Middleware `checkDriverOwnership` đã tìm và xác thực tài xế.
 */
const updateDriver = async (req, res) => {
    try {
        const { name, currentStation, age, status } = req.body;
        const updateData = { name, currentStation, age, status };

        if (req.file) {
            updateData.photo = req.file.path;
        }
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        
        // Sử dụng req.driver._id đã được xác thực
        const updatedDriver = await Driver.findByIdAndUpdate(req.driver._id, updateData, { new: true, runValidators: true })
            .populate('currentStation', 'name city')
            .populate('provider', 'name');
        
        res.status(200).json({ success: true, message: 'Cập nhật tài xế thành công.', data: updatedDriver });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật tài xế.', error: error.message });
    }
};

/**
 * Xóa một tài xế.
 * Middleware `checkDriverOwnership` đã tìm và xác thực tài xế.
 */
const deleteDriver = async (req, res) => {
    try {
        // Sử dụng req.driver đã được xác thực
        if (req.driver.status === 'assigned') {
            return res.status(400).json({ success: false, message: 'Không thể xóa tài xế đang được phân công cho một chuyến đi.' });
        }

        await Driver.findByIdAndDelete(req.driver._id);
        res.status(200).json({ success: true, message: 'Xóa tài xế thành công.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa tài xế.', error: error.message });
    }
};

const updateDriverStation = async (driverId, stationId) => {
    if (!driverId || !stationId) {
        console.error('[updateDriverStation] Lỗi: Cần có driverId và stationId.');
        return;
    }
    try {
        await Driver.findByIdAndUpdate(driverId, { currentStation: stationId, status: 'available' });
        console.log(`[Cập nhật vị trí] Vị trí tài xế ${driverId} đã được cập nhật thành ${stationId}.`);
    } catch (error) {
        console.error(`[Cập nhật vị trí] Lỗi khi cập nhật vị trí tài xế:`, error);
    }
};

// --- THỐNG NHẤT CÁCH EXPORT ---
module.exports = {
    getAllDrivers,
    createDriver,
    getDriverById,
    updateDriver,
    deleteDriver,
    updateDriverStation
};