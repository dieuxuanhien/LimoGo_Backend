const Trip = require('../models/trip');
const Provider = require('../models/provider');
const Driver = require('../models/driver');
const Vehicle = require('../models/vehicle');
const Route = require('../models/route');
const Station = require('../models/station');


// === HÀM DÀNH CHO ADMIN / PROVIDER ===

const createTrip = async (req, res) => {
    try {
        // Chống Mass Assignment: Chỉ lấy các trường được phép
        const { route, vehicle, driver, departureTime, arrivalTime, price, status } = req.body;
        const allowedData = { route, vehicle, driver, departureTime, arrivalTime, price, status };

        // Middleware `getProviderInfo` đã xử lý việc tìm provider
        if (req.user.role === 'provider') {
            allowedData.provider = req.provider._id;
        } else if (req.user.role === 'admin' && req.body.provider) {
            // Admin có thể gán cho provider bất kỳ (nếu provider đó tồn tại)
            allowedData.provider = req.body.provider;
        } else if (req.user.role === 'admin' && !req.body.provider) {
            return res.status(400).json({ success: false, message: 'Admin must specify a provider ID.' });
        }

        const trip = await Trip.create(allowedData);
        res.status(201).json({
            success: true,
            message: 'Trip created successfully',
            data: trip
        });
    } catch (err) {
        // Kiểm tra lỗi cụ thể
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: 'An error occurred while creating the trip', error: err.message });
    }
};

const getAllTrips = async (req, res) => {
    try {
        let filter = {};
        // Nếu là provider, middleware đã tìm và gắn req.provider
        if (req.user.role === 'provider') {
            filter.provider = req.provider._id;
        }

        // --- THÊM DÒNG DEBUG NÀY ---
        console.log('--- DEBUG: getAllTrips Controller ---');
        console.log('Filter object being used:', filter);
        console.log('-----------------------------------');
        // -----------------------------------


        // Logic Phân trang (Pagination)
        const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
        const limit = parseInt(req.query.limit) || 10; // Số lượng bản ghi mỗi trang, mặc định là 10
        const skip = (page - 1) * limit; // Số bản ghi cần bỏ qua

        const [ trips, totalCount ] = await Promise.all([
            Trip.find(filter)
                .populate({ path: 'route', populate: [{ path: 'originStation' }, { path: 'destinationStation' }] })
                .populate('vehicle')
                .populate('driver')
                .populate('provider', 'name')
                .sort({ departureTime: -1 }) // Sắp xếp theo thời gian khởi hành mới nhất
                .skip(skip)
                .limit(limit)
                .lean(),
            Trip.countDocuments(filter) // Đếm tổng số bản ghi
        ]);

        res.status(200).json({
            success: true,
            count: trips.length,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: trips
        });    
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


const getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate({ path: 'route', populate: [{ path: 'originStation' }, { path: 'destinationStation' }] })
            .populate('vehicle')
            .populate('driver')
            .populate('provider');

        if (!trip) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }        
        
        // If provider, only allow access to own trips
        if (req.user.role === 'provider' && String(trip.provider._id) !== String(req.provider._id)) {
            return res.status(403).json({ message: 'Forbidden: Not your trip' });
        }

        res.status(200).json({ success: true, data: trip });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


const updateTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip){
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }

        // Kiểm tra quyền sở hữu nếu là provider
        if (req.user.role === 'provider' && String(trip.provider) !== String(req.provider._id)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Not your trip' });
        }

        // Chống Mass Assignment
        const { vehicle, driver, departureTime, arrivalTime, price, status } = req.body;
        const updateData = { vehicle, driver, departureTime, arrivalTime, price, status };

        // Loại bỏ các trường undefined để không ghi đè giá trị cũ
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            .populate({ path: 'route', populate: [{ path: 'originStation' }, { path: 'destinationStation' }] })
            .populate('vehicle')
            .populate('driver')
            .populate('provider');

        // Logic cập nhật bến đỗ cho tài xế và xe
        if (req.body.status === 'completed') {
            const destinationStationId = updatedTrip.route?.destinationStation?._id;
            if (updatedTrip.driver && destinationStationId) {
                await Driver.findByIdAndUpdate(updatedTrip.driver._id, { currentStation: destinationStationId });
            }
            if (updatedTrip.vehicle && destinationStationId) {
                await Vehicle.findByIdAndUpdate(updatedTrip.vehicle._id, { currentStation: destinationStationId });
            }
        }
        
        res.status(200).json({ success: true, data: updatedTrip });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip){
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }
        
        // Only admin or the owning provider can delete
        if (req.user.role === 'provider' && String(trip.provider) !== String(req.provider._id)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Not your trip' });
        }

        await Trip.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Trip deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// === HÀM DÀNH CHO PUBLIC ===
const searchTripsByCity = async (req, res) => {
    try {
    // --- Bước 1: Lấy dữ liệu đã được "làm sạch" và kiểm tra bởi validator ---
        const { originCity, destinationCity, departureDate } = req.query;

    // --- Bước 2: Tìm kiếm ID các trạm ở thành phố đi và đến (chạy song song) ---
        const [ originStation, destinationStation ] = await Promise.all([
            Station.find( { city: originCity }).select('_id').lean(),
            Station.find( { city: destinationCity }).select('_id').lean()
        ]);

        if (originStation.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy bến xe nào ở thành phố đi: ${originCity}` 
            });
        }

        if (destinationStation.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy bến xe nào ở thành phố đến: ${destinationCity}` 
            });
        }

    // --- Bước 3: Tìm các tuyến đường (routes) phù hợp ---
        const originStationIds = originStation.map(station => station._id);
        const destinationStationIds = destinationStation.map(station => station._id);

        const routes = await Route.find({
            originStation: { $in: originStationIds },
            destinationStation: { $in: destinationStationIds },
        }).select('_id').lean();

        if (routes.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy tuyến đường nào từ ${originCity} đến ${destinationCity}`
            });
        }

    // --- Bước 4: Tìm các chuyến đi (trips) dựa trên routes và ngày đi ---
        const routeIds = routes.map(route => route._id);

        const startOfDay = new Date(departureDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(departureDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const trips = await Trip.find({
            route: { $in: routeIds },
            departureTime: {
                 $gte: startOfDay, 
                 $lte: endOfDay 
            },
            status : 'scheduled'
        })
        .populate({
            path: 'route',
            populate: [
                { path: 'originStation', select: 'name city' },
                { path: 'destinationStation', select: 'name city' }
            ]
                
        })
        .populate('vehicle', 'type licensePlate capacity image');

        if (trips.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy chuyến đi nào từ ${originCity} đến ${destinationCity} vào ngày ${departureDate}`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Trips found successfully',
            data: trips
        });

    } catch (error){
        console.error('Error searching trips by city:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while searching for trips',
            error: error.message
        });
    } 
}

module.exports = {
    createTrip,
    getTripById,
    getAllTrips,
    updateTrip, 
    deleteTrip,
    searchTripsByCity
};
