const mongoose = require('mongoose');
const hash = require('./utils/hashing'); // Đảm bảo đường dẫn đúng
const { v4: uuidv4 } = require('uuid'); // Để tạo unique IDs (ví dụ cho accessId của Ticket)

// Import các model
const User = require('./models/user');
const Station = require('./models/station');
const Provider = require('./models/provider');
const Vehicle = require('./models/vehicle');
const Driver = require('./models/driver');
const Route = require('./models/route');
const Trip = require('./models/trip');
const Ticket = require('./models/ticket'); // Ticket model có middleware post save Trip nên sẽ tự tạo.
const Itinerary = require('./models/itinerary');

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    if (!MONGO_URI) {
        console.error('Lỗi: MONGO_URI chưa được định nghĩa trong file .env');
        process.exit(1);
    }
    try {
        await mongoose.connect(MONGO_URI);
        console.log('>>> SUCCESS: MongoDB connected successfully!');
    } catch (error) {
        console.error('>>> FAILED: MongoDB connection error:', error);
        process.exit(1);
    }
};

// Hàm tiện ích để tạo ngày giờ ngẫu nhiên trong một khoảng
const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Hàm sắp xếp priceMatrix (copy từ controller, đảm bảo nhất quán)
const sortPriceMatrix = (priceMatrix) => {
    if (!priceMatrix) return [];
    return priceMatrix.sort((a, b) => {
        const originCmp = String(a.originStop).localeCompare(String(b.originStop));
        if (originCmp !== 0) return originCmp;
        return String(a.destinationStop).localeCompare(String(b.destinationStop));
    });
};


const seedData = async () => {
    try {
        console.log('--- Deleting old data...');
        // Xóa dữ liệu cũ theo đúng thứ tự phụ thuộc
        await Ticket.deleteMany({});
        await Trip.deleteMany({});
        await Itinerary.deleteMany({});
        await Route.deleteMany({});
        await Vehicle.deleteMany({});
        await Driver.deleteMany({});
        await Provider.deleteMany({});
        await Station.deleteMany({});
        await User.deleteMany({});
        console.log('--- Old data deleted successfully.');

        console.log('--- Creating new sample data...');

        // --- 1. Tạo Users ---
        let usersToCreate = [
            { email: 'admin@limogo.com', password: 'password123', phoneNumber: '+84111111111', userRole: 'admin', name: 'Admin LimoGo', verified: true },
            { email: 'provider.futa@limogo.com', password: 'password123', phoneNumber: '+84222222222', userRole: 'provider', name: 'Nhà xe Phương Trang', verified: true },
            { email: 'provider.thanhbuoi@limogo.com', password: 'password123', phoneNumber: '+84333333333', userRole: 'provider', name: 'Nhà xe Thành Bưởi', verified: true },
            // Thêm nhiều customer hơn
            ...Array.from({ length: 100 }, (_, i) => ({ // 100 customers
                email: `customer${i + 1}@gmail.com`,
                password: 'password123',
                phoneNumber: `+84${600000000 + i}`,
                userRole: 'customer',
                name: `Khách hàng ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
                verified: true
            }))
        ];

        for (let user of usersToCreate) {
            user.password = await hash.hashPassword(user.password);
        }
        const users = await User.insertMany(usersToCreate);
        const adminUser = users.find(u => u.userRole === 'admin');
        const futaProviderUser = users.find(u => u.email === 'provider.futa@limogo.com');
        const thanhBuoiProviderUser = users.find(u => u.email === 'provider.thanhbuoi@limogo.com');
        const customerUsers = users.filter(u => u.userRole === 'customer');

        console.log(`${users.length} Users đã được tạo.`);

        // --- 2. Tạo Providers ---
        const providers = await Provider.insertMany([
            { name: 'Nhà xe Phương Trang', email: 'contact@futa.vn', phone: '19006067', address: '80 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh', status: 'active', mainUser: futaProviderUser._id },
            { name: 'Nhà xe Thành Bưởi', email: 'contact@thanhbuoi.com', phone: '19006079', address: '266 Lê Hồng Phong, Quận 5, TP. Hồ Chí Minh', status: 'active', mainUser: thanhBuoiProviderUser._id },
            // Thêm 5 providers khác
            ...Array.from({ length: 5 }, (_, i) => ({
                name: `Nhà xe Test ${i + 1}`,
                email: `testprovider${i + 1}@limogo.com`,
                phone: `+84${700000000 + i}`,
                address: `${i + 1} Đường Nguyễn Văn Cừ, Quận ${Math.floor(Math.random()*10)+1}`,
                status: 'active',
                mainUser: customerUsers[i].id // Sử dụng customer làm mainUser tạm thời (đảm bảo không trùng với futa/thanhbuoi)
            }))
        ]);
        const futaProvider = providers.find(p => p.name === 'Nhà xe Phương Trang');
        const thanhBuoiProvider = providers.find(p => p.name === 'Nhà xe Thành Bưởi');
        const allProviders = providers; // Tất cả các provider
        console.log(`${providers.length} Providers đã được tạo.`);

        // --- 3. Tạo STATIONS ---
        const stations = await Station.insertMany([
            { name: 'Bến xe Miền Đông', city: 'TP.HCM', address: 'QL13, P.26, Bình Thạnh', type: 'main_station', coordinates: { lat: 10.8231, lng: 106.6297 } },
            { name: 'Bến xe Đà Lạt', city: 'Đà Lạt', address: '1 Tô Hiến Thành, P.3', type: 'main_station', coordinates: { lat: 11.9404, lng: 108.4357 } },
            { name: 'Bến xe Cần Thơ', city: 'Cần Thơ', address: 'QL1A, P. Hưng Thạnh', type: 'main_station', coordinates: { lat: 10.0452, lng: 105.7468 } },
            { name: 'Bến xe Nha Trang', city: 'Nha Trang', address: '23 Tháng 10, P. Phương Sơn', type: 'main_station', coordinates: { lat: 12.2388, lng: 109.1973 } },
            { name: 'Ngã tư Hàng Xanh', city: 'TP.HCM', address: 'Giao lộ Điện Biên Phủ & Xô Viết Nghệ Tĩnh', type: 'shared_point', coordinates: { lat: 10.7936, lng: 106.7161 } },
            { name: 'Văn phòng FUTA - Đề Thám', city: 'TP.HCM', address: '272 Đề Thám, Quận 1', type: 'private_point', ownerProvider: futaProvider._id, coordinates: { lat: 10.7678, lng: 106.6908 } },
            { name: 'Văn phòng Thành Bưởi - LHP', city: 'TP.HCM', address: '266 Lê Hồng Phong, Quận 5', type: 'private_point', ownerProvider: thanhBuoiProvider._id, coordinates: { lat: 10.7667, lng: 106.6718 } },
            { name: 'Đà Lạt Trạm 1', city: 'Đà Lạt', address: '10 Nguyễn Chí Thanh', type: 'private_point', ownerProvider: futaProvider._id, coordinates: { lat: 11.9366, lng: 108.4346 } },
            // Thêm các điểm đón/trả riêng cho các nhà xe khác (15 điểm)
            ...Array.from({ length: 15 }, (_, i) => ({
                name: `VP Test Provider ${i + 1}`,
                city: ['Hà Nội', 'Đà Nẵng', 'TP.HCM', 'Huế', 'Vũng Tàu'][Math.floor(Math.random()*5)],
                address: `${i + 1} Đường Test, Q.Test`,
                type: 'private_point',
                ownerProvider: allProviders[Math.floor(Math.random() * allProviders.length)]._id,
                coordinates: { lat: 10.7 + i * 0.01, lng: 106.6 + i * 0.01 }
            }))
        ]);
        const bxMienDong = stations.find(s => s.name === 'Bến xe Miền Đông');
        const bxDaLat = stations.find(s => s.name === 'Bến xe Đà Lạt');
        const bxCanTho = stations.find(s => s.name === 'Bến xe Cần Thơ');
        const bxNhaTrang = stations.find(s => s.name === 'Bến xe Nha Trang');
        const ngaTuHangXanh = stations.find(s => s.name === 'Ngã tư Hàng Xanh');
        const vpFuta = stations.find(s => s.name === 'Văn phòng FUTA - Đề Thám');
        const vpThanhBuoi = stations.find(s => s.name === 'Văn phòng Thành Bưởi - LHP');
        const mainStations = stations.filter(s => s.type === 'main_station');
        const allStations = stations;
        console.log(`${stations.length} Stations đã được tạo.`);

        // --- 4. Tạo Drivers ---
        const drivers = [];
        for (let i = 0; i < 70; i++) { // 70 drivers
            const provider = allProviders[Math.floor(Math.random() * allProviders.length)];
            const station = allStations[Math.floor(Math.random() * allStations.length)];
            drivers.push({
                name: `Tài xế ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(97 + Math.floor(Math.random() * 26))} ${i+1}`,
                age: 25 + Math.floor(Math.random() * 30),
                photo: `/uploads/images/driver_photo_${i}.jpg`, // Placeholder photo URL
                provider: provider._id,
                currentStation: station._id,
                status: Math.random() < 0.8 ? 'available' : 'assigned'
            });
        }
        const createdDrivers = await Driver.insertMany(drivers);
        console.log(`${createdDrivers.length} Drivers đã được tạo.`);

        // --- 5. Tạo Vehicles ---
        const vehicles = [];
        const vehicleTypes = ['Giường nằm 40 chỗ', 'Limousine 9 chỗ', 'Ghế ngồi 29 chỗ', 'Giường nằm 34 chỗ'];
        for (let i = 0; i < 50; i++) { // 50 vehicles
            const provider = allProviders[Math.floor(Math.random() * allProviders.length)];
            const station = allStations[Math.floor(Math.random() * allStations.length)];
            vehicles.push({
                provider: provider._id,
                type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
                currentStation: station._id,
                licensePlate: `${Math.floor(10 + Math.random() * 90)}A-${Math.floor(10000 + Math.random() * 90000)}`,
                status: Math.random() < 0.9 ? 'available' : 'maintenance',
                capacity: (Math.random() < 0.5) ? 40 : (Math.random() < 0.5 ? 9 : 29),
                manufacturer: ['Mercedes', 'Hyundai', 'Thaco', 'Ford'][Math.floor(Math.random() * 4)],
                model: `Model ${Math.floor(1000 + Math.random() * 9000)}`,
                image: `/uploads/images/vehicle_${i}.jpg` // Placeholder image URL
            });
        }
        const createdVehicles = await Vehicle.insertMany(vehicles);
        console.log(`${createdVehicles.length} Vehicles đã được tạo.`);

        // --- 6. Tạo Routes ---
        const routes = [];
        const mainStationIds = mainStations.map(s => s._id);

        // Tuyến hệ thống (Admin tạo)
        for (let i = 0; i < mainStationIds.length; i++) {
            for (let j = 0; j < mainStationIds.length; j++) {
                if (i !== j) {
                    routes.push({
                        originStation: mainStationIds[i],
                        destinationStation: mainStationIds[j],
                        distanceKm: Math.floor(100 + Math.random() * 500),
                        estimatedDurationMin: Math.floor(120 + Math.random() * 480),
                        ownerProvider: null // Tuyến hệ thống
                    });
                }
            }
        }
        // Tuyến riêng của Provider (randomly picked origin/destination from all stations)
        for (let i = 0; i < 30; i++) { // 30 private routes
            const provider = allProviders[Math.floor(Math.random() * allProviders.length)];
            const originStation = allStations[Math.floor(Math.random() * allStations.length)];
            let destinationStation;
            do { // Đảm bảo điểm đến khác điểm đi
                destinationStation = allStations[Math.floor(Math.random() * allStations.length)];
            } while (originStation._id.toString() === destinationStation._id.toString());

            routes.push({
                originStation: originStation._id,
                destinationStation: destinationStation._id,
                distanceKm: Math.floor(50 + Math.random() * 400),
                estimatedDurationMin: Math.floor(60 + Math.random() * 300),
                ownerProvider: provider._id
            });
        }
        const createdRoutes = await Route.insertMany(routes);
        console.log(`${createdRoutes.length} Routes đã được tạo.`);

        // --- 7. Tạo Itineraries ---
        const itineraries = [];
        for (let i = 0; i < 60; i++) { // 60 itineraries
            const provider = allProviders[Math.floor(Math.random() * allProviders.length)];
            const baseRouteCandidate = createdRoutes[Math.floor(Math.random() * createdRoutes.length)];
            
            // Lọc baseRoute để đảm bảo nó thuộc provider hoặc là tuyến chung
            const baseRoute = createdRoutes.filter(r => 
                r.ownerProvider === null || r.ownerProvider.toString() === provider._id.toString()
            )[Math.floor(Math.random() * createdRoutes.filter(r => r.ownerProvider === null || r.ownerProvider.toString() === provider._id.toString()).length)];
            
            if (!baseRoute) continue; // Bỏ qua nếu không tìm được baseRoute tương thích

            // Lấy các điểm dừng của itinerary
            let possibleStopsIds = new Set();
            possibleStopsIds.add(baseRoute.originStation.toString());
            possibleStopsIds.add(baseRoute.destinationStation.toString());
            
            // Thêm một vài điểm đón/trả ngẫu nhiên giữa chặng
            // (ưu tiên shared_point hoặc private_point của cùng provider)
            const intermediateStationCandidates = allStations.filter(s => 
                s._id.toString() !== baseRoute.originStation.toString() &&
                s._id.toString() !== baseRoute.destinationStation.toString() &&
                (s.type === 'shared_point' || 
                 (s.type === 'private_point' && s.ownerProvider && s.ownerProvider.toString() === provider._id.toString()))
            ).map(s => s._id.toString());

            const numberOfIntermediateStops = Math.floor(Math.random() * 3); // 0-2 điểm dừng giữa chặng
            for (let k = 0; k < numberOfIntermediateStops; k++) {
                if (intermediateStationCandidates.length > 0) {
                    const randomStop = intermediateStationCandidates[Math.floor(Math.random() * intermediateStationCandidates.length)];
                    possibleStopsIds.add(randomStop);
                }
            }

            // Sắp xếp các điểm dừng theo thứ tự giả định trên tuyến đường
            // (Thực tế phức tạp hơn, cần logic địa lý hoặc thứ tự trên tuyến)
            // Tạm thời sắp xếp theo ID để có thứ tự nhất quán.
            const sortedPossibleStopsIds = Array.from(possibleStopsIds).sort();

            const stops = sortedPossibleStopsIds.map((stationId, idx) => ({
                station: stationId,
                order: idx + 1
            }));
            
            if (stops.length < 2) continue; // Itinerary phải có ít nhất 2 điểm dừng

            itineraries.push({
                name: `Hành trình ${provider.name} ${stations.find(s=>s._id.toString()===stops[0].station)?.name || 'N/A'} - ${stations.find(s=>s._id.toString()===stops[stops.length - 1].station)?.name || 'N/A'} ${i+1}`,
                provider: provider._id,
                baseRoute: baseRoute._id,
                stops: stops
            });
        }
        const createdItineraries = await Itinerary.insertMany(itineraries);
        console.log(`${createdItineraries.length} Itineraries đã được tạo.`);


        // --- 8. Tạo Trips ---
        const trips = [];
        const currentYear = new Date().getFullYear();
        const startDateForTrips = new Date(currentYear, 0, 1); // 1/1 năm hiện tại
        const endDateForTrips = new Date(currentYear + 1, 11, 31); // 31/12 năm sau

        for (let i = 0; i < 200; i++) { // 200 trips (để test pagination và search)
            const itinerary = createdItineraries[Math.floor(Math.random() * createdItineraries.length)];
            const provider = allProviders.find(p => p._id.toString() === itinerary.provider.toString());
            const vehicle = createdVehicles.filter(v => v.provider.toString() === provider._id.toString() && v.status === 'available')[0];
            const driver = createdDrivers.filter(d => d.provider.toString() === provider._id.toString() && d.status === 'available')[0];

            if (!vehicle || !driver) {
                // console.warn(`Skipping trip ${i} due to no available vehicle or driver for provider ${provider.name}`);
                continue; // Bỏ qua nếu không tìm được xe hoặc tài xế phù hợp
            }
            
            const itineraryDetail = await Itinerary.findById(itinerary._id).populate('stops.station');
            const sortedItineraryStops = itineraryDetail.stops.sort((a,b) => a.order - b.order);

            if (sortedItineraryStops.length < 2) continue; // Bỏ qua itinerary không hợp lệ

            const baseDepartureTime = getRandomDate(startDateForTrips, endDateForTrips);
            let currentTravelTime = baseDepartureTime;
            const schedule = [];
            
            for (let j = 0; j < sortedItineraryStops.length; j++) {
                const stop = sortedItineraryStops[j];
                const estimatedArrivalTime = new Date(currentTravelTime.getTime() + (j > 0 ? Math.floor(Math.random() * 30 + 10) * 60 * 1000 : 0)); // Thêm 10-40 phút cho mỗi chặng
                const estimatedDepartureTime = new Date(estimatedArrivalTime.getTime() + Math.floor(Math.random() * 10 + 5) * 60 * 1000); // Dừng 5-15 phút

                schedule.push({
                    station: stop.station._id,
                    estimatedArrivalTime: estimatedArrivalTime,
                    estimatedDepartureTime: estimatedDepartureTime
                });
                currentTravelTime = estimatedDepartureTime;
            }

            const priceMatrix = [];
            for (let k = 0; k < sortedItineraryStops.length; k++) {
                for (let l = k + 1; l < sortedItineraryStops.length; l++) {
                    const originStop = sortedItineraryStops[k].station._id;
                    const destinationStop = sortedItineraryStops[l].station._id;
                    const basePrice = Math.floor(50000 + Math.random() * 200000); // 50k - 250k VND
                    priceMatrix.push({ originStop, destinationStop, price: basePrice });
                }
            }
            const sortedPriceMatrix = sortPriceMatrix(priceMatrix);

            trips.push({
                itinerary: itinerary._id,
                vehicle: vehicle._id,
                driver: driver._id,
                provider: provider._id,
                departureTime: schedule[0].estimatedDepartureTime,
                arrivalTime: schedule[schedule.length - 1].estimatedArrivalTime,
                status: (Math.random() < 0.1) ? 'completed' : (Math.random() < 0.2 ? 'in-progress' : 'scheduled'), // Random status (in-progress, completed, scheduled)
                priceMatrix: sortedPriceMatrix,
                schedule: schedule
            });
        }
        const createdTrips = await Trip.insertMany(trips);
        console.log(`${createdTrips.length} Trips đã được tạo.`);


    } catch (error) {
        console.error("!!! ERROR DURING SEEDING:", error);
    }
};

const run = async () => {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
        await seedData();
    }
    await mongoose.disconnect();
    console.log('Disconnected.');
};

run().catch(err => {
    console.error("!!! SCRIPT FAILED AT TOP LEVEL !!!", err);
    mongoose.disconnect();
});