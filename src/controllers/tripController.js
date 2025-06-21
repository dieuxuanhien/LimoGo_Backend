const Trip = require('../models/trip');
const Route = require('../models/route');
const Station = require('../models/station');
const Vehicle = require('../models/vehicle');


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
    searchTripsByCity
};

