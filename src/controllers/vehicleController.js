const Vehicle = require('../models/vehicle');
const Provider = require('../models/provider');
const Trip = require('../models/trip');

// [GET] /api/vehicles - Lấy danh sách xe (admin thấy tất cả, provider thấy xe của mình)
const getAllVehicles = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'provider') {
            filter.provider = req.provider._id;
        }

        // --- TỐI ƯU: LOGIC PHÂN TRANG ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Chạy song song 2 query: một để lấy dữ liệu, một để đếm tổng số bản ghi
        const [vehicles, totalCount] = await Promise.all([
            Vehicle.find(filter)
                .populate('currentStation', 'name city')
                .populate('provider', 'name')
                .sort({ createdAt: -1 }) // Sắp xếp để kết quả nhất quán
                .skip(skip)
                .limit(limit)
                .lean(),
            Vehicle.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        // Trả về dữ liệu kèm thông tin phân trang
        res.status(200).json({
            success: true,
            data: vehicles,
            pagination: {
                totalCount,
                totalPages,
                currentPage: page,
                limit
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi máy chủ.', error: err.message });
    }
};

// [GET] /api/vehicles/:id - Lấy chi tiết một xe
const getVehicleById = async (req, res) => {
    // Middleware `checkVehicleOwnership` đã tìm và xác thực xe
    // Chúng ta chỉ cần trả về `req.vehicle`
    const vehicle = await req.vehicle.populate([
        { path: 'currentStation' },
        { path: 'provider', select: 'name' }
    ]);
    res.status(200).json({ success: true, data: vehicle });
};

// [POST] /api/vehicles - Tạo xe mới
const createVehicle = async (req, res) => {
    // Dữ liệu đã được validate, chỉ cần lấy ra
    const { type, currentStation, licensePlate, status, capacity, manufacturer, model } = req.body;

    try {
        let providerId;
        if (req.user.role === 'provider') {
            providerId = req.provider._id;
        } else { // Admin phải chỉ định providerId khi tạo
            if (!req.body.provider) {
                return res.status(400).json({ success: false, message: 'Admin phải chỉ định ID của nhà xe.' });
            }
            const providerExists = await Provider.findById(req.body.provider);
            if (!providerExists) {
                return res.status(404).json({ success: false, message: `Không tìm thấy nhà xe với ID: ${req.body.provider}` });
            }
            providerId = req.body.provider;
        }

        const vehicleData = {
            type, currentStation, licensePlate: licensePlate.toUpperCase(), status, capacity, manufacturer, model,
            provider: providerId,
            image: req.file ? req.file.path : req.body.image
        };

        const vehicle = await Vehicle.create(vehicleData);
        res.status(201).json({ success: true, message: 'Tạo xe mới thành công!', data: vehicle });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: `Biển số xe "${licensePlate}" đã tồn tại. Vui lòng chọn biển số khác.`
            });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: "Lỗi validation từ server", error: err.message });
        }
        res.status(500).json({ success: false, message: 'Không thể tạo xe.', error: err.message });
    }
};

// [PATCH] /api/vehicles/:id - Cập nhật thông tin xe
const updateVehicle = async (req, res) => {
    try {
        const vehicle = req.vehicle;
        const { type, currentStation, licensePlate, status, capacity, manufacturer, model } = req.body;
        const updateData = { type, currentStation, licensePlate, status, capacity, manufacturer, model };

        if (req.file) {
            updateData.image = req.file.path;
        } else if (req.body.image) {
            updateData.image = req.body.image;
        }
        
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        Object.assign(vehicle, updateData);
        const updatedVehicle = await vehicle.save();
        await updatedVehicle.populate('currentStation');

        res.status(200).json({ success: true, message: 'Cập nhật thông tin xe thành công!', data: updatedVehicle });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: `Biển số xe "${req.body.licensePlate}" đã tồn tại. Vui lòng chọn biển số khác.`
            });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: "Lỗi validation từ server", error: err.message });
        }
        res.status(500).json({ success: false, message: 'Không thể cập nhật xe.', error: err.message });
    }
};

// [DELETE] /api/vehicles/:id - Xóa xe
const deleteVehicle = async (req, res) => {
    try {
        const vehicleId = req.params.id;
        const activeTrip = await Trip.findOne({
            vehicle: vehicleId,
            status: { $in: ['scheduled', 'ongoing'] }
        });

        if (activeTrip) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa xe này. Xe đang được gán cho một chuyến đi (${activeTrip.status}) sắp diễn ra hoặc đang chạy.`
            });
        }

        await Vehicle.findByIdAndDelete(vehicleId);
        res.status(200).json({ success: true, message: 'Xóa xe thành công.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Không thể xóa xe.', error: err.message });
    }
};

module.exports = {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
};
