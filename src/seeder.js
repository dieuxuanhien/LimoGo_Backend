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
const Itinerary = require('./models/itinerary'); // Có thể không cần cho Trip cũ

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

const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const sortPriceMatrix = (priceMatrix) => {
    // Hàm này sẽ không cần dùng cho Trip cũ vì không có priceMatrix
    return priceMatrix;
};


const seedData = async () => {
    try {
        console.log('--- Deleting old data...');
        await Ticket.deleteMany({});
        await Trip.deleteMany({});
        await Itinerary.deleteMany({}); // Vẫn xóa Itinerary nếu bạn dùng chung seeder
        await Route.deleteMany({});
        await Vehicle.deleteMany({});
        await Driver.deleteMany({});
        await Provider.deleteMany({});
        await Station.deleteMany({});
        await User.deleteMany({});
        console.log('--- Old data deleted successfully.');

        console.log('--- Creating new sample data for OLD TRIP ARCHITECTURE...');

        // --- 1. Tạo Users --- (Giữ nguyên)
        let usersToCreate = [
            { email: 'admin@limogo.com', password: 'password123', phoneNumber: '+84111111111', userRole: 'admin', name: 'Admin LimoGo', verified: true },
            { email: 'provider.futa@limogo.com', password: 'password123', phoneNumber: '+84222222222', userRole: 'provider', name: 'Nhà xe Phương Trang', verified: true },
            { email: 'provider.thanhbuoi@limogo.com', password: 'password123', phoneNumber: '+84333333333', userRole: 'provider', name: 'Nhà xe Thành Bưởi', verified: true },
            ...Array.from({ length: 100 }, (_, i) => ({
                email: `customer${i + 1}@gmail.com`,
                password: 'password123',
                phoneNumber: `+84${600000000 + i}`,
                userRole: 'customer',
                name: `Khách hàng ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
                verified: true
            }))
        ];
        for (let user of usersToCreate) { user.password = await hash.hashPassword(user.password); }
        const users = await User.insertMany(usersToCreate);
        const adminUser = users.find(u => u.userRole === 'admin');
        const futaProviderUser = users.find(u => u.email === 'provider.futa@limogo.com');
        const thanhBuoiProviderUser = users.find(u => u.email === 'provider.thanhbuoi@limogo.com');
        const customerUsers = users.filter(u => u.userRole === 'customer');
        console.log(`${users.length} Users đã được tạo.`);

        // --- 2. Tạo Providers --- (Giữ nguyên)
        const providers = await Provider.insertMany([
            { name: 'Nhà xe Phương Trang', email: 'contact@futa.vn', phone: '19006067', address: '80 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh', status: 'active', mainUser: futaProviderUser._id },
            { name: 'Nhà xe Thành Bưởi', email: 'contact@thanhbuoi.com', phone: '19006079', address: '266 Lê Hồng Phong, Quận 5, TP. Hồ Chí Minh', status: 'active', mainUser: thanhBuoiProviderUser._id },
            ...Array.from({ length: 5 }, (_, i) => ({
                name: `Nhà xe Test ${i + 1}`, email: `testprovider${i + 1}@limogo.com`, phone: `+84${700000000 + i}`, address: `${i + 1} Đường Nguyễn Văn Cừ, Quận ${Math.floor(Math.random()*10)+1}`, status: 'active', mainUser: customerUsers[i].id
            }))
        ]);
        const futaProvider = providers.find(p => p.name === 'Nhà xe Phương Trang');
        const thanhBuoiProvider = providers.find(p => p.name === 'Nhà xe Thành Bưởi');
        const allProviders = providers;
        console.log(`${providers.length} Providers đã được tạo.`);

        // --- 3. Tạo STATIONS --- (Giữ nguyên)
        const stations = await Station.insertMany([
            { name: 'Bến xe Miền Đông', city: 'TP.HCM', address: 'QL13, P.26, Bình Thạnh', type: 'main_station', coordinates: { lat: 10.8231, lng: 106.6297 } },
            { name: 'Bến xe Đà Lạt', city: 'Đà Lạt', address: '1 Tô Hiến Thành, P.3', type: 'main_station', coordinates: { lat: 11.9404, lng: 108.4357 } },
            { name: 'Bến xe Cần Thơ', city: 'Cần Thơ', address: 'QL1A, P. Hưng Thạnh', type: 'main_station', coordinates: { lat: 10.0452, lng: 105.7468 } },
            { name: 'Bến xe Nha Trang', city: 'Nha Trang', address: '23 Tháng 10, P. Phương Sơn', type: 'main_station', coordinates: { lat: 12.2388, lng: 109.1973 } },
            { name: 'Bến xe Đà Nẵng', city: 'Đà Nẵng', address: 'Tôn Đức Thắng, P. Hòa Minh', type: 'main_station', coordinates: { lat: 16.0792, lng: 108.1678 } },
            { name: 'Bến xe Huế', city: 'Huế', address: 'An Dương Vương, P. An Cựu', type: 'main_station', coordinates: { lat: 16.4593, lng: 107.5912 } },
            { name: 'Ngã tư Hàng Xanh', city: 'TP.HCM', address: 'Giao lộ Điện Biên Phủ & Xô Viết Nghệ Tĩnh', type: 'shared_point', coordinates: { lat: 10.7936, lng: 106.7161 } },
            { name: 'Văn phòng FUTA - Đề Thám', city: 'TP.HCM', address: '272 Đề Thám, Quận 1', type: 'private_point', ownerProvider: futaProvider._id, coordinates: { lat: 10.7678, lng: 106.6908 } },
            { name: 'Văn phòng Thành Bưởi - LHP', city: 'TP.HCM', address: '266 Lê Hồng Phong, Quận 5', type: 'private_point', ownerProvider: thanhBuoiProvider._id, coordinates: { lat: 10.7667, lng: 106.6718 } },
            { name: 'Đà Lạt Trạm 1', city: 'Đà Lạt', address: '10 Nguyễn Chí Thanh', type: 'private_point', ownerProvider: futaProvider._id, coordinates: { lat: 11.9366, lng: 108.4346 } },
            ...Array.from({ length: 15 }, (_, i) => ({
                name: `VP Test Provider ${i + 1}`, city: ['Hà Nội', 'Đà Nẵng', 'TP.HCM', 'Huế', 'Vũng Tàu'][Math.floor(Math.random()*5)], address: `${i + 1} Đường Test, Q.Test`, type: 'private_point', ownerProvider: allProviders[Math.floor(Math.random() * allProviders.length)]._id, coordinates: { lat: 10.7 + i * 0.01, lng: 106.6 + i * 0.01 }
            }))
        ]);
        const bxMienDong = stations.find(s => s.name === 'Bến xe Miền Đông');
        const bxDaLat = stations.find(s => s.name === 'Bến xe Đà Lạt');
        const bxCanTho = stations.find(s => s.name === 'Bến xe Cần Thơ');
        const bxNhaTrang = stations.find(s => s.name === 'Bến xe Nha Trang');
        const bxDaNang = stations.find(s => s.name === 'Bến xe Đà Nẵng');
        const bxHue = stations.find(s => s.name === 'Bến xe Huế');
        const ngaTuHangXanh = stations.find(s => s.name === 'Ngã tư Hàng Xanh');
        const vpFuta = stations.find(s => s.name === 'Văn phòng FUTA - Đề Thám');
        const vpThanhBuoi = stations.find(s => s.name === 'Văn phòng Thành Bưởi - LHP');
        const mainStations = stations.filter(s => s.type === 'main_station');
        const allStations = stations;
        console.log(`${stations.length} Stations đã được tạo.`);

        // --- 4. Tạo Drivers --- (Giữ nguyên)
        const drivers = [];
        for (let i = 0; i < 70; i++) {
            const provider = allProviders[Math.floor(Math.random() * allProviders.length)];
            const station = allStations[Math.floor(Math.random() * allStations.length)];
            drivers.push({ name: `Tài xế ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(97 + Math.floor(Math.random() * 26))} ${i+1}`, age: 25 + Math.floor(Math.random() * 30), photo: `/uploads/images/driver_photo_${i}.jpg`, provider: provider._id, currentStation: station._id, status: Math.random() < 0.8 ? 'available' : 'assigned' });
        }
        const createdDrivers = await Driver.insertMany(drivers);
        console.log(`${createdDrivers.length} Drivers đã được tạo.`);

        // --- 5. Tạo Vehicles --- (Giữ nguyên)
        const vehicles = [];
        const vehicleTypes = ['Giường nằm 40 chỗ', 'Limousine 9 chỗ', 'Ghế ngồi 29 chỗ', 'Giường nằm 34 chỗ'];
        for (let i = 0; i < 50; i++) {
            const provider = allProviders[Math.floor(Math.random() * allProviders.length)];
            const station = allStations[Math.floor(Math.random() * allStations.length)];
            vehicles.push({ provider: provider._id, type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)], currentStation: station._id, licensePlate: `${Math.floor(10 + Math.random() * 90)}A-${Math.floor(10000 + Math.random() * 90000)}`, status: Math.random() < 0.9 ? 'available' : 'maintenance', capacity: (Math.random() < 0.5) ? 40 : (Math.random() < 0.5 ? 9 : 29), manufacturer: ['Mercedes', 'Hyundai', 'Thaco', 'Ford'][Math.floor(Math.random() * 4)], model: `Model ${Math.floor(1000 + Math.random() * 9000)}`, image: `/uploads/images/vehicle_${i}.jpg` });
        }
        const createdVehicles = await Vehicle.insertMany(vehicles);
        console.log(`${createdVehicles.length} Vehicles đã được tạo.`);

        // --- 6. Tạo Routes --- (Giữ nguyên, Route cũ không có ownerProvider)
        const routes = [];
        const majorStations = [bxMienDong, bxDaLat, bxCanTho, bxNhaTrang, bxDaNang, bxHue]; // Thêm bxDaNang, bxHue
        const allStationIds = stations.map(s => s._id);

        // Tuyến hệ thống giữa các bến xe chính
        for (let i = 0; i < majorStations.length; i++) {
            for (let j = 0; j < majorStations.length; j++) {
                if (i !== j) {
                    routes.push({
                        originStation: majorStations[i]._id,
                        destinationStation: majorStations[j]._id,
                        distanceKm: Math.floor(100 + Math.random() * 500),
                        estimatedDurationMin: Math.floor(120 + Math.random() * 480),
                        // ownerProvider: null // Không có trường này trong Route cũ
                    });
                }
            }
        }
        // Tuyến riêng của Provider (randomly picked origin/destination from all stations)
        // LƯU Ý: KIẾN TRÚC ROUTE CŨ KHÔNG CÓ ownerProvider.
        // Cần bỏ trường này khỏi object Route nếu muốn khớp hoàn toàn.
        // TẠM THỜI: Vẫn tạo Route này, nhưng sẽ bỏ ownerProvider khi tạo Trip.
        // Hoặc loại bỏ hẳn việc tạo "tuyến riêng" nếu Route cũ không hỗ trợ.
        // Để đơn giản và khớp kiến trúc cũ, tôi sẽ loại bỏ ownerProvider khỏi Route model.
        for (let i = 0; i < 30; i++) { // 30 private routes (sẽ là tuyến chung trong kiến trúc cũ)
            const originStation = allStations[Math.floor(Math.random() * allStations.length)];
            let destinationStation; do { destinationStation = allStations[Math.floor(Math.random() * allStations.length)]; } while (originStation._id.toString() === destinationStation._id.toString());
            routes.push({ originStation: originStation._id, destinationStation: destinationStation._id, distanceKm: Math.floor(50 + Math.random() * 400), estimatedDurationMin: Math.floor(60 + Math.random() * 300) }); // Bỏ ownerProvider
        }
        const createdRoutes = await Route.insertMany(routes);
        console.log(`${createdRoutes.length} Routes đã được tạo.`);

        // --- 7. Tạo Itineraries --- (Sẽ BỎ QUA nếu chỉ seed Trip cũ)
        // Nếu Trip cũ không dùng Itinerary, chúng ta KHÔNG TẠO ITINERARY cho Trips.
        const createdItineraries = []; // Không tạo itineraries nếu chỉ seed Trip cũ
        console.log(`0 Itineraries đã được tạo (Bỏ qua cho kiến trúc Trip cũ).`);


        // --- 8. Tạo Trips (Kiến trúc CŨ) ---
        const trips = [];
        const currentYear = new Date().getFullYear();
        const startDateForTrips = new Date(currentYear, 0, 1);
        const endDateForTrips = new Date(currentYear + 1, 11, 31);

        for (let i = 0; i < 200; i++) { // 200 trips (để test pagination và search)
            const provider = allProviders[Math.floor(Math.random() * allProviders.length)];
            const vehicle = createdVehicles.filter(v => v.provider.toString() === provider._id.toString() && v.status === 'available')[0];
            const driver = createdDrivers.filter(d => d.provider.toString() === provider._id.toString() && d.status === 'available')[0];
            const route = createdRoutes[Math.floor(Math.random() * createdRoutes.length)]; // Chọn một Route ngẫu nhiên

            if (!vehicle || !driver || !route) {
                // console.warn(`Skipping trip ${i} due to no available vehicle, driver or route.`);
                continue;
            }

            const departureTime = getRandomDate(startDateForTrips, endDateForTrips);
            const arrivalTime = new Date(departureTime.getTime() + route.estimatedDurationMin * 60 * 1000 + (Math.random() * 60 * 60 * 1000)); // Thêm thời gian dừng/nghỉ ngẫu nhiên
            const price = Math.floor(50000 + Math.random() * 200000); // Giá ngẫu nhiên

            trips.push({
                route: route._id, // Route ID
                vehicle: vehicle._id, // Vehicle ID
                driver: driver._id, // Driver ID
                provider: provider._id, // Provider ID
                departureTime: departureTime,
                arrivalTime: arrivalTime,
                price: price, // Giá đơn lẻ
                status: (Math.random() < 0.1) ? 'completed' : (Math.random() < 0.2 ? 'in-progress' : 'scheduled'), // Random status
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