const mongoose = require('mongoose');
const hash = require('./utils/hashing'); // Đảm bảo đường dẫn đúng
const { v4: uuidv4 } = require('uuid'); // Để tạo unique IDs hoặc accessId

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

// Hàm sắp xếp priceMatrix (copy từ controller)
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
            { email: 'provider.futa@limogo.com', password: 'password123', phoneNumber: '+84222222222', userRole: 'provider', name: 'Provider Futa', verified: true },
            { email: 'provider.thanhbuoi@limogo.com', password: 'password123', phoneNumber: '+84333333333', userRole: 'provider', name: 'Provider Thanh Buoi', verified: true },
            // Thêm nhiều customer hơn
            ...Array.from({ length: 50 }, (_, i) => ({
                email: `customer${i + 1}@gmail.com`,
                password: 'password123',
                phoneNumber: `+84${600000000 + i}`,
                userRole: 'customer',
                name: `Customer ${String.fromCharCode(65 + i)}`,
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
            // Thêm nhiều providers khác
            ...Array.from({ length: 5 }, (_, i) => ({
                name: `Nhà xe Test ${i + 1}`,
                email: `testprovider${i + 1}@limogo.com`,
                phone: `+84${700000000 + i}`,
                address: `${i + 1} Đường Quang Trung, Quận ${i + 1}`,
                status: 'active',
                mainUser: customerUsers[i + 2].id // Sử dụng customer làm mainUser tạm thời
            }))
        ]);
        const futaProvider = providers.find(p => p.name === 'Nhà xe Phương Trang');
        const thanhBuoiProvider = providers.find(p => p.name === 'Nhà xe Thành Bưởi');
        const otherProviders = providers.filter(p => p._id.toString() !== futaProvider._id.toString() && p._id.toString() !== thanhBuoiProvider._id.toString());
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
            // Thêm các điểm đón/trả riêng cho các nhà xe khác
            ...Array.from({ length: 10 }, (_, i) => ({
                name: `VP Test Provider ${i + 1}`,
                city: 'TP.HCM',
                address: `${i + 1} Test St, Dist 1`,
                type: 'private_point',
                ownerProvider: otherProviders[Math.floor(Math.random() * otherProviders.length)]._id,
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
        console.log(`${stations.length} Stations đã được tạo.`);

        // --- 4. Tạo Drivers ---
        const drivers = [];
        for (let i = 0; i < 50; i++) { // 50 drivers
            const provider = providers[Math.floor(Math.random() * providers.length)];
            const station = stations[Math.floor(Math.random() * stations.length)];
            drivers.push({
                name: `Tài xế ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${i}`,
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
        for (let i = 0; i < 30; i++) { // 30 vehicles
            const provider = providers[Math.floor(Math.random() * providers.length)];
            const station = stations[Math.floor(Math.random() * stations.length)];
            vehicles.push({
                provider: provider._id,
                type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
                currentStation: station._id,
                licensePlate: `${Math.floor(10 + Math.random() * 90)}F-${Math.floor(10000 + Math.random() * 90000)}`,
                status: Math.random() < 0.9 ? 'available' : 'maintenance',
                capacity: (Math.random() < 0.5) ? 40 : (Math.random() < 0.5 ? 9 : 29),
                manufacturer: ['Mercedes', 'Hyundai', 'Thaco'][Math.floor(Math.random() * 3)],
                model: `Model ${Math.floor(1000 + Math.random() * 9000)}`,
                image: `/uploads/images/vehicle_${i}.jpg` // Placeholder image URL
            });
        }
        const createdVehicles = await Vehicle.insertMany(vehicles);
        console.log(`${createdVehicles.length} Vehicles đã được tạo.`);

        // --- 6. Tạo Routes ---
        const routes = [];
        const majorStations = [bxMienDong, bxDaLat, bxCanTho, bxNhaTrang];
        const allStationIds = stations.map(s => s._id);

        // Tuyến hệ thống (Admin tạo)
        for (let i = 0; i < majorStations.length; i++) {
            for (let j = 0; j < majorStations.length; j++) {
                if (i !== j) {
                    routes.push({
                        originStation: majorStations[i]._id,
                        destinationStation: majorStations[j]._id,
                        distanceKm: Math.floor(100 + Math.random() * 500),
                        estimatedDurationMin: Math.floor(120 + Math.random() * 480),
                        ownerProvider: null // Tuyến hệ thống
                    });
                }
            }
        }
        // Tuyến riêng của Provider (randomly picked origin/destination)
        for (let i = 0; i < 20; i++) { // 20 private routes
            const provider = providers[Math.floor(Math.random() * providers.length)];
            const originStation = stations[Math.floor(Math.random() * stations.length)];
            let destinationStation;
            do { // Đảm bảo điểm đến khác điểm đi
                destinationStation = stations[Math.floor(Math.random() * stations.length)];
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
        for (let i = 0; i < 40; i++) { // 40 itineraries
            const provider = providers[Math.floor(Math.random() * providers.length)];
            const baseRoute = createdRoutes[Math.floor(Math.random() * createdRoutes.length)]; // Lấy route bất kỳ
            
            // Lấy các điểm dừng của itinerary
            let possibleStops = [];
            // Bao gồm originStation và destinationStation của baseRoute
            possibleStops.push(baseRoute.originStation.toString());
            possibleStops.push(baseRoute.destinationStation.toString());
            
            // Thêm một vài điểm đón/trả ngẫu nhiên giữa chặng (trong cùng thành phố với origin/destination nếu có thể)
            // hoặc các shared_point
            const intermediateStations = stations.filter(s => 
                s.type === 'shared_point' || 
                (s.type === 'private_point' && s.ownerProvider && s.ownerProvider.toString() === provider._id.toString()) ||
                (s.city === stations.find(st => st._id.toString() === baseRoute.originStation.toString())?.city) ||
                (s.city === stations.find(st => st._id.toString() === baseRoute.destinationStation.toString())?.city)
            ).map(s => s._id.toString());

            const numberOfIntermediateStops = Math.floor(Math.random() * 3); // 0-2 điểm dừng giữa chặng
            for (let k = 0; k < numberOfIntermediateStops; k++) {
                if (intermediateStations.length > 0) {
                    const randomStop = intermediateStations[Math.floor(Math.random() * intermediateStations.length)];
                    if (!possibleStops.includes(randomStop)) {
                        possibleStops.push(randomStop);
                    }
                }
            }

            // Sắp xếp các điểm dừng theo thứ tự giả định trên tuyến đường
            // (Thực tế phức tạp hơn, cần logic địa lý hoặc thứ tự trên tuyến)
            // Tạm thời sắp xếp theo ID để có thứ tự nhất quán.
            possibleStops.sort();

            const stops = possibleStops.map((stationId, idx) => ({
                station: stationId,
                order: idx + 1
            }));

            // Nếu baseRoute có ownerProvider là null, và itinerary này cũng có provider khác null,
            // đảm bảo itinerary chỉ dùng route chung của hệ thống.
            // Ngược lại, nếu route có ownerProvider, itinerary này phải thuộc cùng provider đó.
            let validBaseRoute = baseRoute;
            if (baseRoute.ownerProvider && baseRoute.ownerProvider.toString() !== provider._id.toString()) {
                // Nếu baseRoute là riêng của provider khác, tìm baseRoute chung hoặc của provider này
                const compatibleRoutes = createdRoutes.filter(r => 
                    r.ownerProvider === null || r.ownerProvider.toString() === provider._id.toString()
                );
                validBaseRoute = compatibleRoutes[Math.floor(Math.random() * compatibleRoutes.length)];
            }


            itineraries.push({
                name: `Hành trình ${provider.name} ${stops[0]?.order? stations.find(s => s._id.toString() === stops[0].station)?.name : 'N/A'} - ${stops[stops.length - 1]?.order? stations.find(s => s._id.toString() === stops[stops.length - 1].station)?.name : 'N/A'} ${i+1}`,
                provider: provider._id,
                baseRoute: validBaseRoute._id,
                stops: stops
            });
        }
        const createdItineraries = await Itinerary.insertMany(itineraries);
        console.log(`${createdItineraries.length} Itineraries đã được tạo.`);


        // --- 8. Tạo Trips ---
        const trips = [];
        const currentYear = new Date().getFullYear();
        const futureDate = new Date(currentYear + 1, 0, 1); // 1/1 năm sau
        const pastDate = new Date(currentYear - 1, 0, 1); // 1/1 năm trước

        for (let i = 0; i < 100; i++) { // 100 trips (để test pagination)
            const itinerary = createdItineraries[Math.floor(Math.random() * createdItineraries.length)];
            const provider = providers.find(p => p._id.toString() === itinerary.provider.toString());
            const vehicle = createdVehicles.filter(v => v.provider.toString() === provider._id.toString() && v.status === 'available')[0];
            const driver = createdDrivers.filter(d => d.provider.toString() === provider._id.toString() && d.status === 'available')[0];

            if (!vehicle || !driver) {
                // console.warn(`Skipping trip ${i} due to no available vehicle or driver for provider ${provider.name}`);
                continue;
            }
            
            // Tạo schedule dựa trên itinerary.stops
            const itineraryDetail = await Itinerary.findById(itinerary._id).populate('stops.station');
            const sortedItineraryStops = itineraryDetail.stops.sort((a,b) => a.order - b.order);

            const baseDepartureTime = getRandomDate(new Date(), futureDate); // Ngày khởi hành trong tương lai
            let currentTravelTime = baseDepartureTime;
            const schedule = [];
            
            // Generate schedule
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

            // Tạo priceMatrix
            const priceMatrix = [];
            for (let k = 0; k < sortedItineraryStops.length; k++) {
                for (let l = k + 1; l < sortedItineraryStops.length; l++) {
                    const originStop = sortedItineraryStops[k].station._id;
                    const destinationStop = sortedItineraryStops[l].station._id;
                    const basePrice = Math.floor(50000 + Math.random() * 200000); // 50k - 250k VND
                    priceMatrix.push({ originStop, destinationStop, price: basePrice });
                }
            }
            
            // Sắp xếp priceMatrix
            const sortedPriceMatrix = sortPriceMatrix(priceMatrix);

            trips.push({
                itinerary: itinerary._id,
                vehicle: vehicle._id,
                driver: driver._id,
                provider: provider._id,
                departureTime: schedule[0].estimatedDepartureTime,
                arrivalTime: schedule[schedule.length - 1].estimatedArrivalTime,
                status: (Math.random() < 0.1) ? 'completed' : (Math.random() < 0.2 ? 'cancelled' : 'scheduled'), // Random status
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